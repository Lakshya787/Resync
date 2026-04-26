import express from "express";
import { extractTranscript } from "../controllers/transcriptController.js";

const transcriptRouter = express.Router();

transcriptRouter.post("/", extractTranscript);

transcriptRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default transcriptRouter;
