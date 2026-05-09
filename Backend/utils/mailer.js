const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
  },
});

const sendResetEmail = async (email, token) => {
  const resetLink = `https://medicalsafefrontend.vercel.app/reset-password/${token}`;

  await transporter.sendMail({
    from: `"MedicalSafe" <${process.env.EMAIL_USER}>`,
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