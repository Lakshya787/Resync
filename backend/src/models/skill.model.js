import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["programming", "exam", "math", "design"],
      required: true,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export const Skill = mongoose.model("Skill", skillSchema);
