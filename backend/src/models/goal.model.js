import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["skill", "exam", "career"],
      required: true,
    },
    description: {
      type: String,
    },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
