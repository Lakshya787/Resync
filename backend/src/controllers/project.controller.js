import { ProjectSubmission } from "../models/projectSubmission.model.js";
import { UserActiveStep } from "../models/userActiveStep.model.js";
import { UserGoal } from "../models/userGoal.model.js";

export const submitProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { repoLink, description } = req.body;

    if (!repoLink) {
      return res.status(400).json({
        success: false,
        message: "Repository link is required"
      });
    }

    // 1️⃣ Ensure active goal exists
    const activeGoal = await UserGoal.findOne({
      user: userId,
      status: "active"
    });

    if (!activeGoal) {
      return res.status(400).json({
        success: false,
        message: "No active goal found"
      });
    }

    // 2️⃣ Ensure active step exists
    const activeStep = await UserActiveStep.findOne({
      user: userId,
      goal: activeGoal.goal,
      status: "active"
    }).populate("step");

    if (!activeStep) {
      return res.status(400).json({
        success: false,
        message: "No active step found"
      });
    }

    // 3️⃣ Ensure step type is project
    if (activeStep.step.type !== "project") {
      return res.status(400).json({
        success: false,
        message: "Current active step is not a project step"
      });
    }

    // 4️⃣ Prevent duplicate submission
    const existingSubmission = await ProjectSubmission.findOne({
      user: userId,
      step: activeStep.step._id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "Project already submitted for this step"
      });
    }

    // 5️⃣ Create submission
    const submission = await ProjectSubmission.create({
      user: userId,
      step: activeStep.step._id,
      repoLink,
      description,
      approved: true
    });

    return res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: submission
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getProjectHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissions = await ProjectSubmission.find({
      user: userId
    })
      .populate("step")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Project history fetched successfully",
      data: submissions.map(p => ({
        projectId: p._id,
        stepName: p.step?.title,
        stepType: p.step?.type,
        repoLink: p.repoLink,
        description: p.description,
        approved: p.approved,
        submittedAt: p.createdAt
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};