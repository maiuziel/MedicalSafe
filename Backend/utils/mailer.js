const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mayuz@ac.sce.ac.il",
    pass: "qwvrygakbawawbnc",
  },
});

const sendResetEmail = async (email, token) => {
    const resetLink = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: `"MedicalSafe" <your-email@gmail.com>`,
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