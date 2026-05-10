const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  const resetLink = `https://medicalsafefrontend.vercel.app/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MedicalSafe" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire soon.</p>
    `,
  });
};

module.exports = sendResetEmail;
