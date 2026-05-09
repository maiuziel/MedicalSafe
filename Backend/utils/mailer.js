const nodemailer = require("nodemailer");
const dns = require("dns").promises;

const sendResetEmail = async (email, token) => {
  const resetLink = `https://medicalsafefrontend.vercel.app/reset-password/${token}`;

  const [ipv4] = await dns.resolve4("smtp.gmail.com");

  const transporter = nodemailer.createTransport({
    host: ipv4,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
    },
    tls: {
      servername: "smtp.gmail.com",
    },
  });

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
