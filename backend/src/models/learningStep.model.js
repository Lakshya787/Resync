import mongoose from "mongoose";

const learningStepSchema = new mongoose.Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    type: {
      type: String,
      enum: ["learn", "project", "revision", "specialization"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    },
    estimatedDays: {
      type: Number,
      required: true,
    },
    unlockAfterProjects: {
      type: Number,
    },
    sequence: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const LearningStep = mongoose.model(
  "LearningStep",
  learningStepSchema
);
