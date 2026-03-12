import mongoose, { Schema } from "mongoose";

const aiResultLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    type: {
      type: String,
      enum: ["next_step", "evaluation", "specialization"],
      required: true
    },
    inputContext: {
      type: Schema.Types.Mixed
    },
    output: {
      type: Schema.Types.Mixed
    },
    model: {
      type: String,
      default: "gemini-3-flash-preview"
    }
  },
  { timestamps: true }
);

export const AIResultLog = mongoose.model(
  "AIResultLog",
  aiResultLogSchema
);