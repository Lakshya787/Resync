import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Robust CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://resync-jwzeatjgw-lakshya787s-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"));
  },
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import authRouter from "./routes/auth.route.js";
import goalRouter from "./routes/goal.route.js";
import stepRouter from "./routes/step.route.js";
import projectRouter from "./routes/project.route.js";
import aiRouter from "./routes/ai.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import actionRouter from "./routes/action.route.js";
import userRouter from "./routes/user.route.js";
import router from "./routes/test.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/goal", goalRouter);
app.use("/api/v1/step", stepRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/actions", actionRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/test", router);

export { app };