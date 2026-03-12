import { UserActiveStep } from "../models/userActiveStep.model.js";
import { UserGoal } from "../models/userGoal.model.js";
import { LearningStep } from "../models/learningStep.model.js";
import { UserSkill } from "../models/userSkill.model.js";
import { Action } from "../models/action.model.js";

import { generateAI } from "../services/gemini.service.js";
import { generateFirstAction } from "../services/action.service.js";
import { grantExp } from "../services/exp.service.js";



/* ======================================================
GET ACTIVE STEP
====================================================== */

export const getActiveStep = async (req, res) => {
  try {

    const userId = req.user._id;

    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (!activeGoal) {
      return res.status(400).json({
        success: false,
        message: "No active goal"
      });
    }

    const activeStep = await UserActiveStep
      .findOne({
        user: userId,
        goal: activeGoal.goal,
        status: "active"
      })
      .populate("step");

    if (!activeStep) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stepId: activeStep._id,
        title: activeStep.step?.title,
        description: activeStep.step?.description,
        type: activeStep.step?.type,
        deadline: activeStep.deadline
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



/* ======================================================
COMPLETE STEP
====================================================== */

export const completeStep = async (req, res) => {

  try {

    const userId = req.user._id;

    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (!activeGoal) {
      return res.status(400).json({
        success: false,
        message: "No active goal"
      });
    }

    const activeStep = await UserActiveStep
      .findOne({
        user: userId,
        goal: activeGoal.goal,
        status: "active"
      })
      .populate("step");

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step"
      });
    }


    /* ensure all actions finished */

    if (activeStep.step.type !== "project") {

      const remaining = await Action.countDocuments({
        userActiveStep: activeStep._id,
        status: { $ne: "completed" }
      });

      if (remaining > 0) {

        return res.status(400).json({
          success: false,
          message: "Finish all actions first"
        });

      }
      await grantExp(userId, 200);
    }


    activeStep.status = "completed";
    activeStep.completedAt = new Date();

    await activeStep.save();


    /* skill update */

    if (activeStep.step?.skill) {

      await UserSkill.findOneAndUpdate(
        { user: userId, skill: activeStep.step.skill },
        { $inc: { level: 1 } },
        { upsert: true }
      );

    }


    return res.status(200).json({
      success: true,
      message: "Step completed"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



/* ======================================================
STEP HISTORY
====================================================== */

export const getStepHistory = async (req, res) => {
  try {

    const userId = req.user._id;

    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (!activeGoal) {
      return res.status(400).json({
        success: false,
        message: "No active goal"
      });
    }

    // roadmap steps
    const roadmapSteps = await LearningStep.find({
      goal: activeGoal.goal
    }).sort({ sequence: 1 });

    // user progress
    const userSteps = await UserActiveStep.find({
      user: userId,
      goal: activeGoal.goal
    });

    const stepMap = {};
    userSteps.forEach(step => {
      stepMap[step.step.toString()] = step;
    });

    const roadmap = roadmapSteps.map(step => {

      const progress = stepMap[step._id.toString()];

      return {
        stepId: step._id,
        title: step.title,
        type: step.type,
        description: step.description,
        sequence: step.sequence,
        status: progress ? progress.status : "locked",
        completedAt: progress?.completedAt || null
      };

    });

    return res.status(200).json({
      success: true,
      data: roadmap
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/* ======================================================
CREATE STEP
====================================================== */

export const createStep = async (req, res) => {

  try {

    const userId = req.user._id;


    /* active goal */

    const activeGoal = await UserGoal
      .findOne({
        user: userId,
        status: "active"
      })
      .populate("goal");

    if (!activeGoal) {

      return res.status(400).json({
        success: false,
        message: "No active goal"
      });

    }


    /* ensure no active step */

    const existing = await UserActiveStep.findOne({
      user: userId,
      goal: activeGoal.goal,
      status: "active"
    });

    if (existing) {

      return res.status(400).json({
        success: false,
        message: "Complete current step first"
      });

    }


    /* step history */

    const completedSteps = await UserActiveStep
      .find({
        user: userId,
        goal: activeGoal.goal,
        status: "completed"
      })
      .populate("step");


    const stepHistory = completedSteps.map(s => ({
      title: s.step.title,
      type: s.step.type
    }));


    /* last step actions */

    let previousActions = [];

    if (completedSteps.length > 0) {

      const lastStep = completedSteps[completedSteps.length - 1];

      const actions = await Action
        .find({ userActiveStep: lastStep._id })
        .sort({ sequence: 1 });

      previousActions = actions.map(a => a.title);

    }


    const inputContext = {

      goal: activeGoal.goal.name,
      completedSteps: stepHistory,
      previousStepActions: previousActions

    };


 const nextStepPrompt = `
You are an expert curriculum designer building structured learning roadmaps.

Your task is to generate the NEXT learning step for a user.

GOAL
${activeGoal.goal.name}

COMPLETED STEPS
${JSON.stringify(stepHistory)}

PREVIOUS STEP ACTIONS
${JSON.stringify(previousActions)}

STEP GENERATION RULES

1. Generate ONLY ONE new step.
2. The step must logically follow the completed steps.
3. Do NOT repeat or duplicate topics already covered.
4. The step must move the learner closer to achieving the goal.
5. The step must be large enough to contain multiple actions.
6. The step should represent a meaningful milestone in the roadmap.

STEP TYPES

learn → learning concepts or theory  
project → building something practical  
revision → reviewing or strengthening knowledge  
specialization → deeper advanced topic

QUALITY GUIDELINES

- Title must be specific and clear.
- Description must explain:
  • what the learner will learn
  • why the step is important
  • how it helps reach the goal
- Avoid vague steps like "learn more" or "practice".

TIME GUIDELINES

- timeInHours should be realistic.
- Typically between 4 and 25 hours.

OUTPUT RULES

- Return ONLY valid JSON
- No explanations
- No markdown
- No extra text

FORMAT
{
"title":"",
"description":"",
"type":"learn | project | revision | specialization",
"timeInHours":number
}
`;

    const aiRaw = await generateAI(nextStepPrompt);

    let parsed;

    try {

      parsed = JSON.parse(aiRaw);

    } catch {

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON"
      });

    }


    const { title, description, type, timeInHours } = parsed;

    if (!title || !description || !type || !timeInHours) {

      return res.status(500).json({
        success: false,
        message: "AI response incomplete"
      });

    }


    const sequence = completedSteps.length + 1;
    const estimatedDays = Math.ceil(Number(timeInHours) / 2);


    const learningStep = await LearningStep.create({

      goal: activeGoal.goal._id,
      title,
      description,
      type,
      estimatedDays,
      sequence

    });


    const deadline = new Date();
    deadline.setDate(deadline.getDate() + estimatedDays);


    const userActiveStep = await UserActiveStep.create({

      user: userId,
      goal: activeGoal.goal._id,
      step: learningStep._id,
      deadline,
      status: "active"

    });


    /* generate first action */

    if (type !== "project") {

      await generateFirstAction(
        userActiveStep._id,
        learningStep,
        activeGoal.pacePreference
      );

    }


    return res.status(201).json({

      success: true,
      message: "Step created",
      data: {
        stepId: learningStep._id,
        title,
        description,
        type
      }

    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};