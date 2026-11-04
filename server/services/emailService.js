const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter using environment variables
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Send Password Reset Email with Professional HTML Template
 *
 * @param {Object} user - User document
 * @param {string} rawToken - 32-byte hex reset token
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`;
  const senderEmail = process.env.EMAIL_FROM || '"FoodLink Security" <noreply@foodlink.org>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FoodLink Password Reset</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background-color: #064e3b; padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header span { color: #34d399; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; background-color: #ecfdf5; color: #047857; border-radius: 9999px; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); }
        .notice { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0; font-size: 13px; color: #92400e; border-radius: 4px; }
        .footer { background-color: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .url-box { word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11px; color: #475569; border: 1px solid #cbd5e1; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Food<span>Link</span></h1>
          <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 12px;">Zero Waste. Zero Hunger.</p>
        </div>
        <div class="content">
          <span class="badge">Password Security</span>
          <div class="greeting">Hello ${user.name || 'FoodLink Member'},</div>
          <p>We received a request to reset your password for your <strong>FoodLink</strong> account associated with <strong>${user.email}</strong>.</p>
          <p>Click the button below to choose a new password. This link is single-use and will expire in <strong>15 minutes</strong>.</p>
          
          <div class="button-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
          </div>

          <div class="notice">
            ⏰ <strong>15-Minute Expiration:</strong> For your security, this password reset link will expire in 15 minutes.
          </div>

          <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste the following URL into your browser:</p>
          <div class="url-box">${resetUrl}</div>

          <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
            🛡️ <strong>Did not request this?</strong> If you did not request a password reset, you can safely disregard this email. Your account remains completely secure.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} FoodLink System. Protecting communities and eliminating surplus food waste.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
FoodLink – Password Reset Request

Hello ${user.name || 'FoodLink Member'},

We received a request to reset the password for your FoodLink account (${user.email}).

Please click the link below to set a new password (valid for 15 minutes):
${resetUrl}

If you did not make this request, please ignore this email.

— FoodLink Platform Security Team
  `.trim();

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[SMTP DEV MODE - NO CREDENTIALS CONFIGURED]`);
    console.log(`Simulated email to: ${user.email}`);
    console.log(`Password reset link: ${resetUrl}`);
    console.log(`======================================================\n`);
    return { success: true, devMode: true, resetUrl };
  }

  const mailOptions = {
    from: senderEmail,
    to: user.email,
    subject: 'FoodLink – Password Reset Request',
    text: textContent,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};

module.exports = {
  sendPasswordResetEmail,
};
