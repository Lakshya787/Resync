import express from "express";
import { mentorAI } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const aiRouter = express.Router();

aiRouter.post("/mentor", authMiddleware, mentorAI);

export default aiRouter;
