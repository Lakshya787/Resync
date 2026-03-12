import { Action } from "../models/action.model.js";
import { UserActiveStep } from "../models/userActiveStep.model.js";
import { generateNextAction } from "../services/action.service.js";
import { grantExp } from "../services/exp.service.js";


/* ======================================================
GET ACTIVE ACTION
====================================================== */

export const getActiveAction = async (req, res) => {
  try {

    const userId = req.user._id;

    const activeStep = await UserActiveStep.findOne({
      user: userId,
      status: "active"
    });

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step"
      });
    }

    const action = await Action.findOne({
      userActiveStep: activeStep._id,
      status: { $in: ["pending", "in-progress"] }
    }).sort({ sequence: 1 });

    return res.status(200).json({
      success: true,
      data: action || null
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



/* ======================================================
START SESSION (TEST VERSION)
====================================================== */

export const startSession = async (req, res) => {

  try {

    const activeStep = await UserActiveStep.findOne({
      user: req.user._id,
      status: "active"
    });

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step"
      });
    }

    const action = await Action.findOne({
      userActiveStep: activeStep._id,
      status: { $in: ["pending", "in-progress"] }
    }).sort({ sequence: 1 });

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "No active action"
      });
    }

    action.status = "in-progress";

    await action.save();

    return res.json({
      success: true,
      message: "Session started"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



/* ======================================================
STOP SESSION (TEST VERSION)
====================================================== */

export const stopSession = async (req, res) => {
  try {

    const userId = req.user._id;

    const activeStep = await UserActiveStep.findOne({
      user: userId,
      status: "active"
    });

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step"
      });
    }

    const action = await Action.findOne({
      userActiveStep: activeStep._id,
      status: "in-progress"
    });

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "No active session"
      });
    }

    await action.save();

    return res.status(200).json({
      success: true,
      message: "Session stopped"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



/* ======================================================
COMPLETE ACTION (TEST VERSION)
====================================================== */

export const completeAction = async (req, res) => {
  try {

    const userId = req.user._id;

    const activeStep = await UserActiveStep.findOne({
      user: userId,
      status: "active"
    }).populate("step");

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step"
      });
    }

    const action = await Action.findOne({
      userActiveStep: activeStep._id,
      status: { $in: ["pending", "in-progress"] }
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "No active action"
      });
    }

    // normalize date (prevents timezone shifting)
    const now = new Date();
    const completedDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    action.status = "completed";
    action.completedAt = completedDate;

    await action.save();

    const completedActions = await Action.countDocuments({
      userActiveStep: activeStep._id,
      status: "completed"
    });

    const maxActions = activeStep.step.estimatedDays;

    if (completedActions < maxActions) {
      await generateNextAction(activeStep._id);
    }

    await grantExp(action.user, 25, true);

    return res.status(200).json({
      success: true,
      message: "Action completed. Next action unlocked."
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/* ======================================================
GET ACTION HISTORY
====================================================== */

export const getActionHistory = async (req, res) => {
  try {

    const userId = req.user._id;

    const history = await Action.find({
      user: userId,
      status: "completed"
    })
    .sort({ completedAt: -1 })
    .select("title description sequence completedAt");

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};