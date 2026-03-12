import express from "express";
import {
  getActiveStep,
  completeStep,
  getStepHistory,
  createStep
} from "../controllers/step.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const stepRouter = express.Router();

stepRouter.get("/active", authMiddleware, getActiveStep);
stepRouter.post("/create", authMiddleware, createStep);
stepRouter.post("/complete", authMiddleware, completeStep);
stepRouter.get("/history", authMiddleware, getStepHistory);

export default stepRouter;