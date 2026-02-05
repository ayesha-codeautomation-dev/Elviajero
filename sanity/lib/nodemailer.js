import nodemailer from "nodemailer";

// Create a transporter using your email provider (e.g., Gmail, SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail", // or other services like SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send verification email
export const sendVerificationEmail = async (toEmail, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
