// src/services/mail.service.js
import { MailtrapClient } from "mailtrap";


const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY,
  sandbox: process.env.MAILTRAP_USE_SANDBOX === "true",
  testInboxId: Number(process.env.MAILTRAP_INBOX_ID),
});

export const sendEmail = async ({ to, subject, text, html }) => {
  return client.send({
    from: {
      name: "Resync",
      email: "sandbox@example.com",
    },
    to: [{ email: to }],
    subject,
    text,
    html,
  });
};
