import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },
    videoId: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    quizName: {
      type: String,
      default: "Video Quiz",
    },
    detailedResults: {
      type: [{
        question: String,
        options: [String],
        answer: String,
        userAnswer: String,
        isCorrect: Boolean,
        explanation: String,
        topic: String,
      }],
      default: [],
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    wrongTopics: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "Easy", "Medium", "Hard"],
      default: "Medium",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Virtual for percentage score
quizResultSchema.virtual("percentageScore").get(function () {
  if (!this.total || this.total === 0) return 0;
  return Math.round((this.score / this.total) * 100);
});

// Ensure virtuals are included in JSON representation
quizResultSchema.set('toJSON', { virtuals: true });
quizResultSchema.set('toObject', { virtuals: true });

// Add index on createdAt descending
quizResultSchema.index({ createdAt: -1 });

export const QuizResult = mongoose.model("QuizResult", quizResultSchema);
