import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Your SMTP host
      port: parseInt(process.env.SMTP_PORT || "587"), // SMTP port
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS, // SMTP password
      },
    });

    const info = await transporter.sendMail({
      from: `"Your Company" <${process.env.SMTP_FROM}>`, // Sender email
      to, // Recipient email
      subject, // Email subject
      text, // Plain text body
      html, // HTML body
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
