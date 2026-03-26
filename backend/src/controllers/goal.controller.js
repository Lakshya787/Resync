import { Goal } from "../models/goal.model.js";
import { UserGoal } from "../models/userGoal.model.js";
import { UserActiveStep } from "../models/userActiveStep.model.js";
import { generateAI } from "../services/gemini.service.js";
import { generateFirstAction } from "../services/action.service.js";
import { LearningStep } from "../models/learningStep.model.js";
import {User} from "../models/user.model.js"
// Later: import step generation service

// 1️⃣ Get All Available Goals

export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id;

    const goals = await Goal.find({
      createdBy: userId
    });

    return res.status(200).json({
      success: true,
      message: "Goals fetched successfully",
      data: goals
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2️⃣ Get Active Goal
export const getActiveGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    }).populate("goal");

    if (!activeGoal) {
      return res.status(200).json({
        success: true,
        message: "No active goal",
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active goal fetched",
      data: activeGoal
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//3 selectgoal
export const selectGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goalId, pacePreference } = req.body;

    if (!goalId || !pacePreference) {
      return res.status(400).json({
        success: false,
        message: "Goal ID and pace preference are required"
      });
    }

    // Ensure goal belongs to user
    const goalExists = await Goal.findOne({
      _id: goalId,
      createdBy: userId
    });

    if (!goalExists) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    // 1️⃣ Pause currently active goal + its active step
    const currentActiveGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (currentActiveGoal) {
      currentActiveGoal.status = "paused";
      await currentActiveGoal.save();

      await UserActiveStep.updateMany(
        { user: userId, status: "active" },
        { status: "paused" }
      );
    }

    // 2️⃣ Activate selected goal
    let userGoal = await UserGoal.findOne({
      user: userId,
      goal: goalId
    });

    if (userGoal) {
      userGoal.status = "active";
      userGoal.pacePreference = pacePreference;
      await userGoal.save();
    } else {
      userGoal = await UserGoal.create({
        user: userId,
        goal: goalId,
        pacePreference,
        status: "active"
      });
    }

    // 3️⃣ Resume paused step if exists
    const pausedStep = await UserActiveStep.findOne({
  user: userId,
  goal: goalId,
  status: "paused"
}).sort({ updatedAt: -1 });


    if (pausedStep) {
      pausedStep.status = "active";
      await pausedStep.save();
    }

    return res.status(200).json({
      success: true,
      message: "Goal activated successfully",
      data: userGoal
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4️⃣ Pause Goal
export const pauseGoal = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (!activeGoal) {
      return res.status(400).json({
        success: false,
        message: "No active goal to pause"
      });
    }

    activeGoal.status = "paused";
    await activeGoal.save();

    // Optional: deactivate active step as well
await UserActiveStep.updateMany(
  { user: userId, status: "active" },
  { status: "paused" }
);


    return res.status(200).json({
      success: true,
      message: "Goal paused successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// 5️⃣ Create Goal (User can define up to 2 goals)
export const createGoal = async (req, res) => {
  try {

    const userId = req.user._id;
        const user = await User.findById(userId).select("education");
  const userEducation = user?.education || "General learner";
    const { name, category, description, pacePreference } = req.body;

    if (!name || !category || !pacePreference) {
      return res.status(400).json({
        success: false,
        message: "Name, category and pacePreference required"
      });
    }

    /* limit goals */

    const createdGoalsCount = await Goal.countDocuments({
      createdBy: userId
    });

    if (createdGoalsCount >= 2) {
      return res.status(400).json({
        success: false,
        message: "You can only create up to 2 goals"
      });
    }

    /* create goal */

    const newGoal = await Goal.create({
      name,
      category,
      description,
      createdBy: userId
    });
    /* check active goal */

const existingActiveGoal = await UserGoal.findOne({
  user: userId,
  status: "active"
});

if (existingActiveGoal) {
  return res.status(400).json({
    success: false,
    message: "You already have an active goal. Complete or deactivate it first."
  });
}
    /* activate goal for user */

    const userGoal = await UserGoal.create({
      user: userId,
      goal: newGoal._id,
      pacePreference,
      status: "active"
    });

    /* AI generate first step */
const  firstStepPrompt=`
You are an expert curriculum designer and career mentor familiar with the Indian education system.

Your task is to generate the FIRST step for a learning journey based on the user's goal.

USER CONTEXT
Education Level: ${userEducation}

IMPORTANT EDUCATION GUIDELINES

If the learner is in school (Class 10, Class 11, or Class 12):
- The first step should help them understand the academic path required to reach the goal.
- The step should include guidance about subjects, streams, or exams they may need in the future.
- The step must still be divisible into daily learning actions.

Examples:
- Doctor → choose PCB/PCMB in Class 11–12 and prepare for NEET
- Software Engineer → choose PCM and later prepare for JEE / programming
- Designer → build creative portfolio and relevant subject exposure

If the learner is NOT in school (college, graduate, or general learner):
- Focus on foundational knowledge required to start learning the skill.

GOAL
${name}

GOAL DESCRIPTION
${description || "No additional description provided."}

STEP DESIGN RULES
- Generate ONLY the first step of the roadmap
- The step must represent a meaningful starting milestone
- The step must be divisible into multiple daily actions
- The step description should clearly explain:
  • what the learner will learn or explore
  • why this step is important
  • what knowledge or skills it prepares them for

STEP TYPE DEFINITIONS
learn → conceptual learning and understanding
project → building something practical
revision → reinforcing previously learned knowledge
specialization → advanced or niche topic

OUTPUT RULES
- Output MUST be valid JSON
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include extra text
- Return ONLY the JSON object

OUTPUT FORMAT
{
"title":"",
"description":"",
"type":"learn | project | revision | specialization",
"timeInHours":number
}
`;

    const aiRaw = await generateAI(firstStepPrompt);

    let parsed;

    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON"
      });
    }

    const { title, description: stepDesc, type, timeInHours } = parsed;

    const estimatedDays = Math.ceil(Number(timeInHours) / 2);

    /* create step */

    const learningStep = await LearningStep.create({
      goal: newGoal._id,
      title,
      description: stepDesc,
      type,
      estimatedDays,
      sequence: 1
    });

    /* activate step */

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + estimatedDays);

    const userActiveStep = await UserActiveStep.create({
      user: userId,
      goal: newGoal._id,
      step: learningStep._id,
      deadline,
      status: "active"
    });

    /* create first action */

    let firstAction = null;

    if (type !== "project") {
      firstAction = await generateFirstAction(
        userActiveStep._id,
        learningStep,
        pacePreference
      );
    }

    return res.status(201).json({
      success: true,
      message: "Goal, first step and first action created",
      data: {
        goal: {
          goalId: newGoal._id,
          name: newGoal.name,
          category: newGoal.category
        },
        step: {
          stepId: learningStep._id,
          title: learningStep.title,
          type: learningStep.type,
          estimatedDays
        },
        firstAction: firstAction
          ? {
              actionId: firstAction._id,
              title: firstAction.title,
              estimatedMinutes: firstAction.estimatedMinutes
            }
          : null
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).json({
        success: false,
        message: "Goal ID required"
      });
    }

    // Check if goal belongs to user
    const goal = await Goal.findOne({
      _id: goalId,
      createdBy: userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    // Delete related records
    await UserGoal.deleteMany({ goal: goalId });

    await UserActiveStep.deleteMany({
      user: userId,
      goal: goalId
    });

    await LearningStep.deleteMany({
      goal: goalId
    });

    // Finally delete goal
    await Goal.deleteOne({ _id: goalId });

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};