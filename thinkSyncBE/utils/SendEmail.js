import nodemailer from "nodemailer";

export async function sendMailToUser({ to, subject, html, text }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: {
        name: "ThinkSync",
        address: process.env.SMTP_EMAIL,
      },
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
