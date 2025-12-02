const { sendEmail } = require('./emailService');
const whatsappService = require('./whatsappService');
const NotificationSettings = require('../models/NotificationSettings');

const sendNotifications = async (email, mobile, emailType, emailData, whatsappType, whatsappData) => {
  try {
    const settings = await NotificationSettings.findOne();
    
    // Send email if enabled
    if (settings?.emailEnabled !== false && email) {
      sendEmail(email, emailType, emailData);
    }
    
    // Send WhatsApp if enabled
    if (settings?.whatsappEnabled !== false && mobile && whatsappType) {
      switch (whatsappType) {
        case 'welcome':
          whatsappService.sendWelcomeMessage(mobile, whatsappData.userName);
          break;
        case 'agentRegistration':
          whatsappService.sendAgentRegistrationMessage(mobile, whatsappData.userName, whatsappData.companyName);
          break;
        case 'agentActivated':
          whatsappService.sendAgentActivatedMessage(mobile, whatsappData.userName, whatsappData.companyName);
          break;
        // case 'accountCreated':
        //   whatsappService.sendAccountCreatedMessage(mobile, whatsappData.name, whatsappData.email, whatsappData.password);
        //   break;
        case 'applicationSubmitted':
          whatsappService.sendApplicationSubmittedMessage(mobile, whatsappData.name, whatsappData.appId);
          break;
        case 'statusUpdate':
          whatsappService.sendStatusUpdateMessage(mobile, whatsappData.name, whatsappData.appId, whatsappData.status, whatsappData.remarks);
          break;
        case 'paymentConfirmed':
          whatsappService.sendPaymentConfirmedMessage(mobile, whatsappData.name, whatsappData.amount, whatsappData.appId);
          break;
        case 'visaApproved':
          whatsappService.sendVisaApprovedMessage(mobile, whatsappData.name, whatsappData.country, whatsappData.appId, whatsappData.visaNo, whatsappData.expiry);
          break;
        case 'visaInTransit':
          whatsappService.sendVisaInTransitMessage(mobile, whatsappData.name, whatsappData.appId, whatsappData.courier, whatsappData.trackingNo);
          break;
        case 'draftSaved':
          whatsappService.sendDraftSavedMessage(mobile, whatsappData.name, whatsappData.appId);
          break;
        // case 'agentAssigned':
        //   whatsappService.sendAgentAssignedMessage(mobile, whatsappData.name, whatsappData.agentName, whatsappData.appId, whatsappData.email, whatsappData.agentMobile);
        //   break;
        case 'embassyScheduled':
          whatsappService.sendEmbassyScheduledMessage(mobile, whatsappData.name, whatsappData.appId, whatsappData.dateTime);
          break;
        case 'agentRejection':
          whatsappService.sendAgentRejectionMessage(mobile, whatsappData.userName, whatsappData.reason);
          break;
        case 'applicationStatus':
          whatsappService.sendApplicationStatusMessage(mobile, whatsappData.userName, whatsappData.applicationId, whatsappData.status);
          break;
        case 'paymentConfirmation':
          whatsappService.sendPaymentConfirmationMessage(mobile, whatsappData.userName, whatsappData.amount, whatsappData.applicationId);
          break;
        case 'documentReminder':
          whatsappService.sendDocumentReminderMessage(mobile, whatsappData.userName, whatsappData.documentType);
          break;
        case 'visaApproval':
          whatsappService.sendVisaApprovalMessage(mobile, whatsappData.userName, whatsappData.visaType, whatsappData.country);
          break;
        case 'visaRejection':
          whatsappService.sendVisaRejectionMessage(mobile, whatsappData.userName, whatsappData.visaType, whatsappData.country, whatsappData.reason);
          break;
      }
    }
  } catch (error) {
    console.error('Notification service error:', error);
  }
};

module.exports = { sendNotifications };