import { Resend } from "resend";
import { log } from "./Logger.js";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

export async function sendMailToUser({ to, subject, html, text }) {
  try {
    await resend.emails.send({
      from: "ThinkSync <no-reply@thinksync.me>",
      to,
      subject,
      html,
      text,
    });
    log("Email sent successfully to", to);
  } catch (error) {
    console.error(" Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
