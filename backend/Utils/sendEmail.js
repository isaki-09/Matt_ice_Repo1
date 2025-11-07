import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded HOST:", process.env.EMAIL_HOST);
console.log("Loaded USER:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.EMAIL_PORT) || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@mattice.test",
    to,
    subject,
    html,
  });

  console.log("✅ Email sent / Mailtrap accepted:", info);
}
