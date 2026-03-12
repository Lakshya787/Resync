import mongoose from "mongoose";

const userGoalSchema = new mongoose.Schema(
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
    pacePreference: {
      type: String,
      enum: ["slow", "medium", "fast"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
userGoalSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export const UserGoal = mongoose.model("UserGoal", userGoalSchema);
