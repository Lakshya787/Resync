import { Router } from "express";
import { updateProfile, changePassword } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.patch("/update-profile", authMiddleware, updateProfile);
userRouter.patch("/change-password", authMiddleware, changePassword);

export default userRouter;