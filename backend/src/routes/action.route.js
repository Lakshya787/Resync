import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  getActiveAction,
  startSession,
  stopSession,
  completeAction,
  getActionHistory
} from "../controllers/action.controller.js";

const actionRouter = Router();

/* ======================================================
GET CURRENT ACTIVE ACTION
====================================================== */

actionRouter.get(
  "/active",
  authMiddleware,
  getActiveAction
);

/* ======================================================
START TIMER SESSION
====================================================== */

actionRouter.post(
  "/start-session",
  authMiddleware,
  startSession
);

/* ======================================================
STOP TIMER SESSION
====================================================== */

actionRouter.post(
  "/stop-session",
  authMiddleware,
  stopSession
);

/* ======================================================
COMPLETE ACTION
====================================================== */

actionRouter.post(
  "/complete",
  authMiddleware,
  completeAction
);

actionRouter.get("/history",authMiddleware,getActionHistory)


export default actionRouter;