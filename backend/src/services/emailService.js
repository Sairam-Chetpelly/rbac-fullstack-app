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

// Professional email template base
const createEmailTemplate = (title, content, primaryColor = '#3b82f6', icon = '✈️') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - One World Visa</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                  <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                  <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 600;">One World Visa</h1>
                  <p style="color: #3b82f6; margin: 8px 0 0 0; font-size: 16px;">Your Trusted Visa Partner</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
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
                    <p style="color: #3b82f6; margin: 0 0 8px 0; font-size: 13px;">📱 Phone: <a href="tel:+919167447700" style="color: #3b82f6; text-decoration: none; font-weight: 500;">+91 9167447700</a></p>
                    <div style="background: rgba(249, 115, 22, 0.1); border-radius: 6px; padding: 12px; margin: 8px 0;">
                      <p style="color: #ea580c; margin: 0; font-size: 12px; font-weight: 600;">🕐 Calling Time: 10:00 AM to 7:00 PM (Monday to Saturday)</p>
                    </div>
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
  `;
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: '🎉 Welcome to One World Visa - Your Journey Begins!',
    html: createEmailTemplate('Welcome', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome aboard, ${userName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Congratulations! Your account has been successfully created. You're now part of our global community of travelers.
      </p>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          🌟 Start your visa application journey with confidence and get expert support throughout your journey!
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              Start Your Application
            </a>
          </td>
        </tr>
      </table>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
        Need help? Our support team is available 24/7 to assist you with any questions.
      </p>
    `, '#3b82f6', '🎉')
  }),

  accountCreated: (userName, email, password) => ({
    subject: '🔐 Your Account Has Been Created - Login Details Inside',
    html: createEmailTemplate('Account Created', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to One World Visa, ${userName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Your account has been successfully created by our admin team. Below are your login credentials to access the system.
      </p>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🔐 Your Login Credentials:</p>
        <div style="background: #ffffff; border-radius: 6px; padding: 16px; margin: 12px 0;">
          <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Email: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${email}</span></p>
          <p style="color: #374151; margin: 0; font-size: 15px;">Password: <span style="color: #dc2626; font-weight: 600; font-family: monospace; background: #fef2f2; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
        </div>
        <p style="color: #92400e; margin: 12px 0 0 0; font-size: 14px; font-weight: 500;">
          ⚠️ Please change your password after first login for security.
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              Login to Your Account
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">🌟 Getting Started:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
          • Login using the credentials above<br>
          • Update your profile information<br>
          • Change your password for security<br>
          • Start exploring the system features
        </p>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
        If you have any questions or need assistance, please contact our support team.
      </p>
    `, '#3b82f6', '🔐')
  }),

  forgotPassword: (userName, resetToken) => ({
    subject: '🔐 Reset Your Password - One World Visa',
    html: createEmailTemplate('Password Reset', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        We received a request to reset your password for your One World Visa account. Click the button below to create a new password:
      </p>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              Reset My Password
            </a>
          </td>
        </tr>
      </table>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 20px 0; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" style="color: #3b82f6; word-break: break-all; font-family: monospace; font-size: 14px; text-decoration: none;">${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</a>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          🔒 Security Notice: This link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
        </p>
      </div>
    `, '#3b82f6', '🔐')
  }),

  draftCreated: (userName, applicationId) => ({
    subject: '📝 Draft Saved - Continue Your Visa Application',
    html: createEmailTemplate('Draft Saved', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Your visa application draft has been saved successfully. You can continue filling your application anytime.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0; font-size: 15px;">Application ID: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              Continue Application
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          💡 Tip: Your draft is automatically saved every few minutes while you work on it.
        </p>
      </div>
    `, '#3b82f6', '📝')
  }),

  applicationSubmitted: (userName, applicationId) => ({
    subject: '🎉 Application Submitted Successfully - Agent Will Contact You!',
    html: createEmailTemplate('Application Submitted', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Congratulations ${userName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Your visa application has been submitted successfully! Our agent will contact you within 24 hours for payment details and further processing.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0; font-size: 15px;">Application ID: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
      </div>
      
      <div style="background: rgba(249, 115, 22, 0.05); border-left: 4px solid rgba(249, 115, 22, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #ea580c; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">📞 Agent Contact Information</p>
        <p style="color: #ea580c; margin: 0; font-size: 14px; line-height: 1.6;">
          Our dedicated agent will contact you within 24 hours to discuss:<br>
          • Payment methods and processing<br>
          • Document verification (if needed)<br>
          • Application timeline and next steps<br>
          • Any additional requirements
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              Track Status
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          📧 We'll send you email notifications at each step of the process. Processing begins after payment confirmation.
        </p>
      </div>
    `, '#3b82f6', '🎉')
  }),

  statusUpdate: (userName, applicationId, status, remarks) => ({
    subject: `📊 Status Update: ${status.replace('_', ' ').toUpperCase()} - ${applicationId}`,
    html: createEmailTemplate('Status Update', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Your visa application status has been updated.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #374151; margin: 0; font-size: 16px;">New Status: <span style="color: #059669; font-weight: 600;">${status.replace('_', ' ').toUpperCase()}</span></p>
      </div>
      
      ${remarks ? `
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">💬 Additional Information:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">${remarks}</p>
      </div>
      ` : ''}
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              View Application Details
            </a>
          </td>
        </tr>
      </table>
    `, '#3b82f6', '📊')
  }),

  adminNewApplication: (applicationId, userName, userEmail) => ({
    subject: '🚨 NEW APPLICATION ALERT - Agent Contact Required',
    html: createEmailTemplate('New Application Alert', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">🚨 New Application Submitted</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        A new visa application has been submitted. Agent contact required for payment processing.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #dc2626; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Applicant: <span style="color: #1f2937; font-weight: 600;">${userName}</span></p>
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Email: <span style="color: #3b82f6; font-weight: 500;">${userEmail}</span></p>
        <p style="color: #dc2626; margin: 0; font-size: 15px; font-weight: 600;">Status: Payment Pending - Agent Contact Required</p>
      </div>
      
      <div style="background: rgba(249, 115, 22, 0.05); border-left: 4px solid rgba(249, 115, 22, 0.3); padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #ea580c; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📞 Action Required:</p>
        <p style="color: #ea580c; margin: 0; font-size: 14px; line-height: 1.6;">
          Agent must contact customer within 24 hours to discuss payment methods and processing.
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: rgba(220, 38, 38, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);">
              Review Application Now
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          ⏰ Please assign an agent and initiate customer contact within 24 hours to maintain service quality.
        </p>
      </div>
    `, '#dc2626', '🚨')
  }),

  adminStatusUpdate: (applicationId, userName, oldStatus, newStatus, updatedBy) => ({
    subject: '📊 Admin Alert: Application Status Changed',
    html: createEmailTemplate('Status Change Notification', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">📊 Status Change Notification</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Application status has been updated by ${updatedBy}.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #8b5cf6; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Applicant: <span style="color: #1f2937; font-weight: 600;">${userName}</span></p>
        <p style="color: #374151; margin: 0; font-size: 15px;">Status: <span style="color: #dc2626; font-weight: 600;">${oldStatus}</span> → <span style="color: #059669; font-weight: 600;">${newStatus}</span></p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              View Application Details
            </a>
          </td>
        </tr>
      </table>
    `, '#8b5cf6', '📊')
  }),

  embassyVisitScheduled: (userName, applicationId, visitDateTime) => ({
    subject: '🏛️ Embassy Visit Scheduled - Important Appointment Details',
    html: createEmailTemplate('Embassy Visit Scheduled', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">🏛️ Embassy Visit Scheduled</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${userName}, your embassy visit has been scheduled.
      </p>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">📅 Visit Date & Time: ${new Date(visitDateTime).toLocaleString()}</p>
      </div>
    `, '#f59e0b', '🏛️')
  }),

  embassyVisitReminder: (userName, applicationId, visitDateTime, timeUntil) => ({
    subject: `⏰ Embassy Visit Reminder - ${timeUntil} to go!`,
    html: createEmailTemplate('Embassy Visit Reminder', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">⏰ Embassy Visit Reminder</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${userName}, reminder about your upcoming embassy visit.
      </p>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #92400e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">📅 Visit Date & Time: ${new Date(visitDateTime).toLocaleString()}</p>
        <p style="color: #dc2626; margin: 0; font-size: 20px; font-weight: 700;">⏰ Time Remaining: ${timeUntil}</p>
      </div>
    `, '#f59e0b', '⏰')
  }),

  applicationAssigned: (employeeName, applicationNumber, customerName, customerEmail, visaType) => ({
    subject: '📋 New Application Assigned - Action Required',
    html: createEmailTemplate('Application Assigned', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">📋 New Application Assigned</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${employeeName}, a new visa application has been assigned to you for processing.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Application Number: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${applicationNumber}</span></p>
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Customer: <span style="color: #1f2937; font-weight: 600;">${customerName}</span></p>
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Email: <span style="color: #3b82f6; font-weight: 500;">${customerEmail}</span></p>
        <p style="color: #374151; margin: 0; font-size: 15px;">Visa Type: <span style="color: #059669; font-weight: 600;">${visaType}</span></p>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📝 Your Responsibilities:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
          • Review application details and documents<br>
          • Contact customer for payment processing<br>
          • Update application status as needed<br>
          • Provide regular updates to the customer
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              View Application Details
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(249, 115, 22, 0.05); border-left: 4px solid rgba(249, 115, 22, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #ea580c; margin: 0; font-size: 14px; font-weight: 500;">
          ⏰ Please begin processing this application within 24 hours to maintain our service quality standards.
        </p>
      </div>
    `, '#3b82f6', '📋')
  }),

  paymentConfirmed: (userName, applicationNumber, amount, transactionId) => ({
    subject: '💳 Payment Confirmed - Processing Started',
    html: createEmailTemplate('Payment Confirmed', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">💳 Payment Confirmed</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${userName}, your payment has been confirmed and your visa application processing has started.
      </p>
      
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Application Number: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${applicationNumber}</span></p>
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Amount Paid: <span style="color: #059669; font-weight: 600;">₹${amount}</span></p>
        ${transactionId ? `<p style="color: #166534; margin: 0; font-size: 15px;">Transaction ID: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${transactionId}</span></p>` : ''}
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: rgba(34, 197, 94, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);">
              Track Application Status
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          📧 You will receive regular updates about your application status via email.
        </p>
      </div>
    `, '#22c55e', '💳')
  }),

  visaIssued: (userName, applicationId, countryName, visaNumber, dateOfIssuance, dateOfExpiry, additionalDetails, remarks, hasVisaFiles) => ({
    subject: '🎉 VISA Approved - Your Visa is Ready!',
    html: createEmailTemplate('Visa Approved', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">🎉 Congratulations ${userName}!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 18px; font-weight: 600;">
        Your ${countryName} visa has been successfully Approved! 🌟
      </p>
      
      <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 24px; margin: 30px 0; color: white;">
        <h3 style="color: white; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">📋 Visa Details</h3>
        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Application ID: <span style="font-weight: 600; font-family: monospace;">${applicationId}</span></p>
          ${visaNumber ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Visa Number: <span style="font-weight: 700; font-family: monospace; font-size: 18px;">${visaNumber}</span></p>` : ''}
          ${dateOfIssuance ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Date of Issuance: <span style="font-weight: 600;">${dateOfIssuance}</span></p>` : ''}
          ${dateOfExpiry ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Date of Expiry: <span style="font-weight: 600;">${dateOfExpiry}</span></p>` : ''}
          ${hasVisaFiles ? `<p style="color: white; margin: 0; font-size: 16px;">📎 Visa documents are attached to this email</p>` : ''}
        </div>
      </div>
      
      ${additionalDetails ? `
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📝 Additional Details:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">${additionalDetails}</p>
      </div>
      ` : ''}
      
      ${remarks ? `
      <div style="background: rgba(249, 115, 22, 0.05); border-left: 4px solid rgba(249, 115, 22, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #ea580c; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">💬 Important Notes:</p>
        <p style="color: #ea580c; margin: 0; font-size: 14px; line-height: 1.6;">${remarks}</p>
      </div>
      ` : ''}
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
              View Visa Details
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(34, 197, 94, 0.05); border-left: 4px solid rgba(34, 197, 94, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">🎯 Next Steps:</p>
        <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
          • Print your visa confirmation<br>
          • Check visa validity dates before travel<br>
          • Ensure passport validity (6+ months)<br>
          • Contact us for any travel assistance
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0; padding: 20px; background: rgba(59, 130, 246, 0.02); border-radius: 8px;">
        <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">🌟 Thank you for choosing One World Visa! 🌟</p>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Wishing you safe and happy travels!</p>
      </div>
    `, '#10b981', '🎉')
  }),

  adminVisaIssued: (applicationId, userName, countryName, visaNumber, updatedBy, hasVisaFiles) => ({
    subject: '✅ VISA Approved - Admin Notification',
    html: createEmailTemplate('Admin Visa Approved', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">✅ Visa Successfully Approved</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        A visa has been successfully approved and the customer has been notified.
      </p>
      
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Customer: <span style="color: #1f2937; font-weight: 600;">${userName}</span></p>
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Country: <span style="color: #059669; font-weight: 600;">${countryName}</span></p>
        ${visaNumber ? `<p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Visa Number: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${visaNumber}</span></p>` : ''}
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">Approved by: <span style="color: #1f2937; font-weight: 600;">${updatedBy}</span></p>
        ${hasVisaFiles ? `<p style="color: #166534; margin: 0; font-size: 15px;">📎 Visa files uploaded: Yes</p>` : ''}
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: rgba(34, 197, 94, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);">
              View Application Details
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          📧 Customer notification email has been sent automatically with visa details.
        </p>
      </div>
    `, '#22c55e', '✅')
  }),

  agentRegistration: (userName, companyName) => ({
    subject: '🏢 Agent Registration Received - Under Review',
    html: createEmailTemplate('Agent Registration', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Thank you for registering as an Agent! 🏢</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${userName}, we have received your agent registration for <strong>${companyName}</strong>.
      </p>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #92400e; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📋 What happens next?</p>
        <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
          • Our team will review your application and documents<br>
          • We will verify your company details and credentials<br>
          • You will receive an email notification once approved<br>
          • Processing typically takes 1-2 business days
        </div>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📄 Documents Submitted:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
          • Company registration details<br>
          • PAN card information<br>
          • GST certificate (if applicable)
        </p>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
        If you have any questions during the review process, please contact our support team.
      </p>
    `, '#f59e0b', '🏢')
  }),

  agentActivated: (userName, companyName) => ({
    subject: '🎉 Agent Account Activated - Welcome to One World Visa!',
    html: createEmailTemplate('Agent Activated', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Congratulations ${userName}! 🎉</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Your agent account for <strong>${companyName}</strong> has been successfully activated!
      </p>
      
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #166534; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">✅ Account Status: ACTIVE</p>
        <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
          You can now access all agent features and start managing visa applications.
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: rgba(34, 197, 94, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);">
              Login to Your Account
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">🌟 Agent Benefits:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
          • Access to agent dashboard<br>
          • Manage customer applications<br>
          • Commission tracking<br>
          • Priority support
        </p>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
        Welcome to the One World Visa agent network! We look forward to working with you.
      </p>
    `, '#22c55e', '🎉')
  }),

  agentDeactivated: (userName, companyName, reason) => ({
    subject: '⚠️ Agent Account Deactivated - Important Notice',
    html: createEmailTemplate('Agent Deactivated', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Account Status Update</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Hello ${userName}, your agent account for <strong>${companyName}</strong> has been deactivated.
      </p>
      
      <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">⚠️ Account Status: DEACTIVATED</p>
        ${reason ? `<p style="color: #dc2626; margin: 0; font-size: 14px; line-height: 1.6;">Reason: ${reason}</p>` : ''}
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📞 Need Help?</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
          If you believe this is an error or would like to discuss reactivation, please contact our support team immediately.
        </p>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
        Thank you for your understanding. Our support team is available to assist you.
      </p>
    `, '#ef4444', '⚠️')
  }),

  visaInTransit: (userName, applicationId, countryName, visaNumber, courierName, shipmentRefNumber, shipmentDate, remarks, hasCourierFiles) => ({
    subject: '🚚 Visa In Transit - Courier Details',
    html: createEmailTemplate('Visa In Transit', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">🚚 Your Visa is In Transit!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 18px; font-weight: 600;">
        Hello ${userName}, your ${countryName} visa has been dispatched and is on its way to you! 📦
      </p>
      
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px; padding: 24px; margin: 30px 0; color: white;">
        <h3 style="color: white; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🚚 Courier Details</h3>
        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Application ID: <span style="font-weight: 600; font-family: monospace;">${applicationId}</span></p>
          ${visaNumber ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Visa Number: <span style="font-weight: 700; font-family: monospace; font-size: 18px;">${visaNumber}</span></p>` : ''}
          ${courierName ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Courier: <span style="font-weight: 600;">${courierName}</span></p>` : ''}
          ${shipmentRefNumber ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Tracking Number: <span style="font-weight: 700; font-family: monospace;">${shipmentRefNumber}</span></p>` : ''}
          ${shipmentDate ? `<p style="color: white; margin: 0 0 8px 0; font-size: 16px;">Shipment Date: <span style="font-weight: 600;">${shipmentDate}</span></p>` : ''}
          ${hasCourierFiles ? `<p style="color: white; margin: 0; font-size: 16px;">📎 Courier documents are attached to this email</p>` : ''}
        </div>
      </div>
      
      ${remarks ? `
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">💬 Additional Information:</p>
        <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">${remarks}</p>
      </div>
      ` : ''}
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              Track Application Status
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(34, 197, 94, 0.05); border-left: 4px solid rgba(34, 197, 94, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📦 What to expect:</p>
        <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
          • Your visa will be delivered to your registered address<br>
          • Please keep the tracking number for reference<br>
          • Contact the courier for delivery updates<br>
          • Ensure someone is available to receive the package
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0; padding: 20px; background: rgba(59, 130, 246, 0.02); border-radius: 8px;">
        <p style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">🌟 Thank you for choosing One World Visa! 🌟</p>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Your visa will reach you soon!</p>
      </div>
    `, '#3b82f6', '🚚')
  }),

  adminVisaInTransit: (applicationId, userName, countryName, courierName, shipmentRefNumber, updatedBy, hasCourierFiles) => ({
    subject: '🚚 Admin Alert: Visa In Transit',
    html: createEmailTemplate('Admin Visa In Transit', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">🚚 Visa Dispatched - In Transit</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        A visa has been dispatched and courier details have been updated.
      </p>
      
      <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Application ID: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${applicationId}</span></p>
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Customer: <span style="color: #1f2937; font-weight: 600;">${userName}</span></p>
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Country: <span style="color: #3b82f6; font-weight: 600;">${countryName}</span></p>
        ${courierName ? `<p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Courier: <span style="color: #1f2937; font-weight: 600;">${courierName}</span></p>` : ''}
        ${shipmentRefNumber ? `<p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Tracking: <span style="color: #1f2937; font-weight: 600; font-family: monospace;">${shipmentRefNumber}</span></p>` : ''}
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px;">Updated by: <span style="color: #1f2937; font-weight: 600;">${updatedBy}</span></p>
        ${hasCourierFiles ? `<p style="color: #1e40af; margin: 0; font-size: 15px;">📎 Courier files attached: Yes</p>` : ''}
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              View Application Details
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 500;">
          📧 Customer notification email has been sent automatically with courier details.
        </p>
      </div>
    `, '#3b82f6', '🚚')
  }),

  agentAssigned: (userName, applicationNumber, agentName, agentEmail, agentMobile, visaType) => ({
    subject: '👨‍💼 Agent Assigned - Your Application Monitor',
    html: createEmailTemplate('Agent Assigned', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${userName}! 👨‍💼</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        Great news! Your visa application has been assigned to a dedicated agent who will monitor and assist you throughout the process.
      </p>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Application Number: <span style="color: #3b82f6; font-weight: 600; font-family: monospace;">${applicationNumber}</span></p>
        <p style="color: #374151; margin: 0; font-size: 15px;">Visa Type: <span style="color: #059669; font-weight: 600;">${visaType}</span></p>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid rgba(59, 130, 246, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">👨‍💼 Your Assigned Agent</p>
        <div style="background: #ffffff; border-radius: 6px; padding: 16px; margin: 12px 0;">
          <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Name: <span style="color: #1f2937; font-weight: 600;">${agentName}</span></p>
          <p style="color: #374151; margin: 0 0 8px 0; font-size: 15px;">Email: <span style="color: #3b82f6; font-weight: 600;">${agentEmail}</span></p>
        </div>
      </div>
      
      <div style="background: rgba(249, 115, 22, 0.05); border-left: 4px solid rgba(249, 115, 22, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #ea580c; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">📞 For Any Queries, Please Contact:</p>
        <p style="color: #ea580c; margin: 0; font-size: 14px; line-height: 1.6;">
          Your assigned agent ${agentName} is available to help you with:<br>
          • Application status updates<br>
          • Document requirements<br>
          • Payment processing<br>
          • Any questions or concerns
        </p>
      </div>
      
      <table role="presentation" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/customer/applications" style="display: inline-block; background: rgba(59, 130, 246, 0.9); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
              View Application Status
            </a>
          </td>
        </tr>
      </table>
      
      <div style="background: rgba(34, 197, 94, 0.05); border-left: 4px solid rgba(34, 197, 94, 0.3); padding: 16px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #166534; margin: 0; font-size: 14px; font-weight: 500;">
          📧 You will receive regular updates about your application progress via email.
        </p>
      </div>
    `, '#3b82f6', '👨‍💼')
  }),


};

// Send email function
const sendEmail = async (to, template, data = {}, attachments = []) => {
  // Always show email info in console for development
  console.log(`\n=== EMAIL: ${template.toUpperCase()} ===`);
  console.log(`To: ${to}`);
  console.log(`Data:`, data);
  console.log(`Attachments:`, attachments?.length || 0);
  console.log('============================\n');
  
  if (!emailTransporter) {
    console.log('Email service not configured, only showing email info');
    return;
  }
  
  try {
    let emailContent;
    
    switch (template) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data.userName);
        break;
      case 'accountCreated':
        emailContent = emailTemplates.accountCreated(data.userName, data.email, data.password);
        break;
      case 'forgotPassword':
        emailContent = emailTemplates.forgotPassword(data.userName, data.resetToken);
        break;
      case 'draftCreated':
        emailContent = emailTemplates.draftCreated(data.userName, data.applicationId);
        break;
      case 'applicationSubmitted':
        emailContent = emailTemplates.applicationSubmitted(data.userName, data.applicationId);
        break;
      case 'statusUpdate':
        emailContent = emailTemplates.statusUpdate(data.userName, data.applicationId, data.status, data.remarks);
        break;
      case 'adminNewApplication':
        emailContent = emailTemplates.adminNewApplication(data.applicationId, data.userName, data.userEmail);
        break;
      case 'adminStatusUpdate':
        emailContent = emailTemplates.adminStatusUpdate(data.applicationId, data.userName, data.oldStatus, data.newStatus, data.updatedBy);
        break;
      case 'embassyVisitScheduled':
        emailContent = emailTemplates.embassyVisitScheduled(data.userName, data.applicationId, data.visitDateTime);
        break;
      case 'embassyVisitReminder':
        emailContent = emailTemplates.embassyVisitReminder(data.userName, data.applicationId, data.visitDateTime, data.timeUntil);
        break;
      case 'applicationAssigned':
        emailContent = emailTemplates.applicationAssigned(data.employeeName, data.applicationNumber, data.customerName, data.customerEmail, data.visaType);
        break;
      case 'paymentConfirmed':
        emailContent = emailTemplates.paymentConfirmed(data.userName, data.applicationNumber, data.amount, data.transactionId);
        break;
      case 'visaIssued':
        emailContent = emailTemplates.visaIssued(data.userName, data.applicationId, data.countryName, data.visaNumber, data.dateOfIssuance, data.dateOfExpiry, data.additionalDetails, data.remarks, data.hasVisaFiles);
        break;
      case 'adminVisaIssued':
        emailContent = emailTemplates.adminVisaIssued(data.applicationId, data.userName, data.countryName, data.visaNumber, data.updatedBy, data.hasVisaFiles);
        break;
      case 'agentRegistration':
        emailContent = emailTemplates.agentRegistration(data.userName, data.companyName);
        break;
      case 'agentActivated':
        emailContent = emailTemplates.agentActivated(data.userName, data.companyName);
        break;
      case 'agentDeactivated':
        emailContent = emailTemplates.agentDeactivated(data.userName, data.companyName, data.reason);
        break;
      case 'visaInTransit':
        emailContent = emailTemplates.visaInTransit(data.userName, data.applicationId, data.countryName, data.visaNumber, data.courierName, data.shipmentRefNumber, data.shipmentDate, data.remarks, data.hasCourierFiles);
        break;
      case 'adminVisaInTransit':
        emailContent = emailTemplates.adminVisaInTransit(data.applicationId, data.userName, data.countryName, data.courierName, data.shipmentRefNumber, data.updatedBy, data.hasCourierFiles);
        break;
      case 'agentAssigned':
        emailContent = emailTemplates.agentAssigned(data.userName, data.applicationNumber, data.agentName, data.agentEmail, data.agentMobile, data.visaType);
        break;
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"One World Visa" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      attachments: attachments || []
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`📧 ${template} email sent to ${to}`);
    
    // Send copy to admin for customer emails
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && to !== adminEmail && ['welcome', 'draftCreated', 'applicationSubmitted', 'statusUpdate'].includes(template)) {
      const adminMailOptions = {
        from: process.env.EMAIL_FROM || `"One World Visa" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `[ADMIN COPY] ${emailContent.subject}`,
        html: emailContent.html
      };
      await emailTransporter.sendMail(adminMailOptions);
      console.log(`📧 Admin copy sent to ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(`\n=== EMAIL SEND FAILED - SHOWING INFO ===`);
    console.log(`Template: ${template}`);
    console.log(`To: ${to}`);
    console.log(`Data:`, data);
    console.log('========================================\n');
  }
};

// Send admin notification
const sendAdminNotification = async (template, data = {}, attachments = []) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail(adminEmail, template, data, attachments);
    }
  } catch (error) {
    console.error('Admin notification failed:', error);
  }
};

module.exports = {
  sendEmail,
  sendAdminNotification
};