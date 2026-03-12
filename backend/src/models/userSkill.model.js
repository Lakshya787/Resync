import mongoose from "mongoose";

const userSkillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    level: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  { timestamps: true }
);

userSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

export const UserSkill = mongoose.model("UserSkill", userSkillSchema);
