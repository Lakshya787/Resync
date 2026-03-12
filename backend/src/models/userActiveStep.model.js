import mongoose from "mongoose";

const userActiveStepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    step: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningStep",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed","paused"],
      default: "active",
    },
    deadline: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
userActiveStepSchema.index(
  { user: 1, goal: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" }
  }
);
export const UserActiveStep = mongoose.model(
  "UserActiveStep",
  userActiveStepSchema
);
