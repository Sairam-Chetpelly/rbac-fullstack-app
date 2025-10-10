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
      <title>${title} - Options Travel Services</title>
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
                  <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 600;">Options Travel Services</h1>
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
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                    Options Travel Services
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    © 2025 Options Travel Services. All rights reserved.
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
    subject: '🎉 Welcome to Options Travel Services - Your Journey Begins!',
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

  forgotPassword: (userName, resetToken) => ({
    subject: '🔐 Reset Your Password - Options Travel Services',
    html: createEmailTemplate('Password Reset', `
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
        We received a request to reset your password for your Options Travel Services account. Click the button below to create a new password:
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


};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  // Always show email info in console for development
  console.log(`\n=== EMAIL: ${template.toUpperCase()} ===`);
  console.log(`To: ${to}`);
  console.log(`Data:`, data);
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
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Options Travel Services" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`📧 ${template} email sent to ${to}`);
    
    // Send copy to admin for customer emails
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && to !== adminEmail && ['welcome', 'draftCreated', 'applicationSubmitted', 'statusUpdate'].includes(template)) {
      const adminMailOptions = {
        from: process.env.EMAIL_FROM || `"Options Travel Services" <${process.env.EMAIL_USER}>`,
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
const sendAdminNotification = async (template, data = {}) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail(adminEmail, template, data);
    }
  } catch (error) {
    console.error('Admin notification failed:', error);
  }
};

module.exports = {
  sendEmail,
  sendAdminNotification
};