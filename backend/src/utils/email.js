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
    from: process.env.EMAIL_FROM || `"Options Travel Services" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Options Travel Services',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 30px; text-align: center; background: white;">
          <img src="${process.env.FRONTEND_URL}/optionslogo.png" alt="Options Travel Services" style="height: 80px; margin-bottom: 20px;" />
          <h1 style="color: #333; margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Options Travel Services</p>
        </div>
        
        <div style="padding: 40px 30px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #4f46e5; word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">© 2025 Options Travel Services. All rights reserved.</p>
        </div>
      </div>
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