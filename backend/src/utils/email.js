const nodemailer = require('nodemailer');

let emailTransporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
  console.log("✅ Email service configured")
} else {
  console.warn("⚠️  Email service not configured (EMAIL_USER and EMAIL_PASS not set)")
}

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  // Always show reset URL in console for development
  console.log('\n=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('============================\n');
  
  if (!emailTransporter) {
    console.log('Email service not configured, only showing reset URL');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"One World Visa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - One World Visa',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - One World Visa</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                    <img src="${process.env.FRONTEND_URL}/optionslogo.png" alt="One World Visa" style="height: 60px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />
                    <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 600;">Password Reset</h1>
                    <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 16px;">Secure your account access</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello!</h2>
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                      We received a request to reset your password for your One World Visa account. Click the button below to create a new password:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 30px 0;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${resetUrl}" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 20px 0; font-size: 14px;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
                      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all; font-family: monospace; font-size: 14px; text-decoration: none;">${resetUrl}</a>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
                        🔒 Security Notice: This link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: rgba(59, 130, 246, 0.02); padding: 30px; text-align: center; border-top: 1px solid rgba(59, 130, 246, 0.1);">
                    <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                      One World Visa
                    </p>
                    <div style="background: rgba(59, 130, 246, 0.05); border-radius: 8px; padding: 16px; margin: 15px 0; text-align: center;">
                      <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">📞 Need Help? Contact Our Support Team</p>
                      <p style="color: #3b82f6; margin: 0 0 4px 0; font-size: 13px;">📧 Email: <a href="mailto:visas@oneworldvisa.in" style="color: #3b82f6; text-decoration: none; font-weight: 500;">visas@oneworldvisa.in</a></p>
                      <p style="color: #3b82f6; margin: 0; font-size: 13px;">📱 Phone: <a href="tel:+919167447700" style="color: #3b82f6; text-decoration: none; font-weight: 500;">+91 9167447700</a></p>
                    </div>
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      © 2025 One World Visa. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error)
    console.log('\n=== EMAIL SEND FAILED - SHOWING RESET URL ===');
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('============================================\n');
  }
};

module.exports = { sendPasswordResetEmail };