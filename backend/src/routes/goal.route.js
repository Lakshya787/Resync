import express from "express";
import {
  getGoals,
  selectGoal,
  getActiveGoal,
  pauseGoal,
  createGoal,
  deleteGoal
} from "../controllers/goal.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const goalRouter = express.Router();

goalRouter.get("/", authMiddleware, getGoals);

goalRouter.post("/create", authMiddleware, createGoal);

goalRouter.post("/select", authMiddleware, selectGoal);

goalRouter.get("/active", authMiddleware, getActiveGoal);

goalRouter.patch("/pause", authMiddleware, pauseGoal);

goalRouter.delete("/:goalId", authMiddleware, deleteGoal);   // NEW

export default goalRouter;