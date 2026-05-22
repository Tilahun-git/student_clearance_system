import nodemailer from "nodemailer";

// Brevo (Sendinblue) SMTP transporter
// Set these in your .env / Render environment variables:
//   BREVO_SMTP_USER  — your Brevo login email
//   BREVO_SMTP_PASS  — your Brevo SMTP key (Settings → SMTP & API → SMTP)
export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});
