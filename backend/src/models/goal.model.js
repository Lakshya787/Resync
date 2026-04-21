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
  },
  resources: [
    {
      title: String,
      url: String,
      description: String,
      channel: String,
      duration: String,
      difficulty_level: String,
      reason: String,
      key_concepts: [String]
    }
  ],
  roadmapId: {
    type: String
  },
  roadmap: [
    {
      step_number: Number,
      title: String,
      description: String,
      difficulty: String,
      concepts: [String],
      video_urls: [String]
    }
  ]
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
