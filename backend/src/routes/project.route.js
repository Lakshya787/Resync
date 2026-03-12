import express from "express";
import {
  submitProject,
  getProjectHistory
} from "../controllers/project.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const projectRouter = express.Router();

projectRouter.post("/submit", authMiddleware, submitProject);
projectRouter.get("/history", authMiddleware, getProjectHistory);

export default projectRouter;
