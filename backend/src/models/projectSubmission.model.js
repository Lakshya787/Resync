import mongoose from "mongoose";

const projectSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    step: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningStep",
      required: true,
    },
    repoLink: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    approved: {
      type: Boolean,
      default: true, // MVP: self-approved
    },
  },
  { timestamps: true }
);

export const ProjectSubmission = mongoose.model(
  "ProjectSubmission",
  projectSubmissionSchema
);
