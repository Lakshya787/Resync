import { UserGoal } from "../models/userGoal.model.js";
import { UserActiveStep } from "../models/userActiveStep.model.js";
import { ProjectSubmission } from "../models/projectSubmission.model.js";
import { Action } from "../models/action.model.js";
import { User } from "../models/user.model.js";

import { expRequired } from "../services/exp.service.js";
import { generateNextAction } from "../services/action.service.js";

import { createStep } from "./step.controller.js";

export const getDashboard = async (req, res) => {
  try {

    const userId = req.user._id;

    /* USER */

    const user = await User.findById(userId);
    const nextLevelExp = expRequired(user.level);

    /* ACTIVE GOAL */

    const activeGoal = await UserGoal
      .findOne({
        user: userId,
        status: "active"
      })
      .populate("goal");

    /* ACTIVE STEP */

    let activeStep = await UserActiveStep
      .findOne({
        user: userId,
        status: "active"
      })
      .populate("step");


    /* CREATE STEP IF NONE */

    if (!activeStep && activeGoal) {

      await createStep(req, res);

      activeStep = await UserActiveStep
        .findOne({
          user: userId,
          status: "active"
        })
        .populate("step");

    }


    /* CURRENT ACTION */

    let currentAction = null;

    if (activeStep) {

      currentAction = await Action.findOne({
        userActiveStep: activeStep._id,
        status: { $in: ["pending", "in-progress"] }
      }).sort({ sequence: 1 });


      /* GENERATE NEXT ACTION */

      if (!currentAction) {
        currentAction = await generateNextAction(activeStep._id);
      }

    }


    /* COMPLETED STEPS */

    const completedStepsCount = await UserActiveStep.countDocuments({
      user: userId,
      status: "completed"
    });


    /* PROJECT COUNT */

    const projectCount = await ProjectSubmission.countDocuments({
      user: userId
    });


    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: {

        username: user.username,
        level: user.level,
        exp: user.exp,
        nextLevelExp,
        streak: user.currentStreak,
        education: user.education,

        activeGoal: activeGoal?.goal?.name || null,
        pacePreference: activeGoal?.pacePreference || null,

        activeStep: activeStep
          ? {
              title: activeStep.step?.title,
              type: activeStep.step?.type,
              deadline: activeStep.deadline
            }
          : null,

        currentAction: currentAction
          ? {
              title: currentAction.title,
              description: currentAction.description,
              sequence: currentAction.sequence,
              status: currentAction.status
            }
          : null,

        completedSteps: completedStepsCount,
        projectCount

      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};