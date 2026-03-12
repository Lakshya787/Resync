// test.controller.js
import { sendEmail } from "../mailtrap/mailtrap.config.js";

export const testMail = async (req, res) => {
  await sendEmail({
    to: "your_email@gmail.com",
    subject: "Test Mail",
    text: "It works.",
  });

  res.json({ message: "Email sent" });
};
