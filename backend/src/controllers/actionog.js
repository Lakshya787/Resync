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

    if (!action) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: action
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



/* ======================================================
START SESSION
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

    if (action.lastSessionStart) {
      return res.status(400).json({
        success: false,
        message: "Session already running"
      });
    }

    const now = new Date();

    if (!action.startedAt) {

      action.startedAt = now;

      const expiry = new Date(now);
      expiry.setHours(expiry.getHours() + 24);

      action.expiresAt = expiry;

    }

    action.lastSessionStart = now;
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
STOP SESSION
====================================================== */

export const stopSession = async (req, res) => {
  try {

    const userId = req.user._id;

    /* find active step */

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

    /* find running action */

    const action = await Action.findOne({
      userActiveStep: activeStep._id,
      status: "in-progress"
    });

    if (!action || !action.lastSessionStart) {
      return res.status(400).json({
        success: false,
        message: "No active session"
      });
    }

    const now = new Date();

    const minutes = Math.floor(
      (now - action.lastSessionStart) / 60000
    );

    action.totalTrackedMinutes += minutes;

    action.lastSessionStart = null;

    await action.save();

    return res.status(200).json({
      success: true,
      trackedMinutes: action.totalTrackedMinutes
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/* ======================================================
COMPLETE ACTION
====================================================== */
export const completeAction = async (req, res) => {
  try {

    const userId = req.user._id;

    /* find active step */

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

    /* find current action */

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

    /* expiry check */

    if (action.expiresAt && new Date() > action.expiresAt) {

      action.status = "expired";
      await action.save();

      return res.status(400).json({
        success: false,
        message: "Action expired"
      });

    }

    /* minimum tracked time validation */

    if (action.totalTrackedMinutes < action.minRequiredMinutes) {

      return res.status(400).json({
        success: false,
        message: "Minimum time not reached"
      });

    }

    /* mark action completed */

    action.status = "completed";
    action.completedAt = new Date();

    await action.save();

    /* count completed actions */

    const completedActions = await Action.countDocuments({
      userActiveStep: activeStep._id,
      status: "completed"
    });

    const maxActions = activeStep.step.estimatedDays;

    const now = new Date();

    /* enforce 1 action per day */

    if (
      completedActions < maxActions &&
      action.expiresAt &&
      now >= action.expiresAt
    ) {

      await generateNextAction(activeStep._id);
       await grantExp(action.user, 25, true);
    }

    return res.status(200).json({
      success: true,
      message: "Action completed. Next action unlocks after 24 hours."
    });
    

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};