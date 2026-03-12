import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  userActiveStep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserActiveStep",
    required: true
  },

  step: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LearningStep",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill"
  },

  difficultyLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  },

  estimatedMinutes: {
    type: Number,
    required: true
  },

  minRequiredMinutes: {
    type: Number,
    required: true
  },

  totalTrackedMinutes: {
    type: Number,
    default: 0
  },

  lastSessionStart: {
    type: Date
  },

  startedAt: {
    type: Date
  },

  expiresAt: {
    type: Date
  },

  completedAt: {
    type: Date
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "expired"],
    default: "pending"
  },

  sequence: {
    type: Number,
    required: true
  }
},
{ timestamps: true }
);

actionSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "in-progress" }
  }
);

actionSchema.index({ userActiveStep: 1, sequence: 1 });

export const Action = mongoose.model("Action", actionSchema);