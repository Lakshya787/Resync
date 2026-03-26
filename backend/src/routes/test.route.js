import { Router } from "express";
import { sendEmail } from "../services/mail.service.js";

const router = Router();

router.get("/test-mail", async (req, res) => {
  try {
    await sendEmail({
      to: "lakshyadewangan78@gmail.com",
      subject: "Resync test",
      text: "Email system works"
    });

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email failed", error: error.message });
  }
});

export default router;