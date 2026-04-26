import express from "express";
import { generateQuiz, saveResult, getHistory, analyzeWeaknesses } from "../controllers/quizController.js";

const quizRouter = express.Router();

quizRouter.post("/generate", generateQuiz);
quizRouter.post("/result", saveResult);
quizRouter.get("/history", getHistory);
quizRouter.get("/weaknesses", analyzeWeaknesses);

quizRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default quizRouter;
