const https = require('https');

const sendOtpEmail = async (email, otp) => {
  const body = JSON.stringify({
    sender: { name: 'MedicalSafe', email: process.env.EMAIL_FROM },
    to: [{ email }],
    subject: 'Your MedicalSafe Login Code',
    htmlContent: `
      <h2>Login Verification Code</h2>
      <p>Your one-time code is:</p>
      <h1 style="letter-spacing:8px;color:#4f8df7;">${otp}</h1>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve();
          else reject(new Error(`Brevo error: ${res.statusCode} ${data}`));
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

module.exports = sendOtpEmail;
