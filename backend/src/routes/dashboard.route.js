import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/",authMiddleware,getDashboard);

export default dashboardRouter;
