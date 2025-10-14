const { sendEmail } = require('./emailService');
const { sendNotification } = require('../controllers/whatsappController');
const NotificationSettings = require('../models/NotificationSettings');

const sendNotifications = async (email, mobile, emailType, emailData, whatsappMessage) => {
  try {
    const settings = await NotificationSettings.findOne();
    
    // Send email if enabled
    if (settings?.emailEnabled !== false && email) {
      sendEmail(email, emailType, emailData);
    }
    
    // Send WhatsApp if enabled
    if (settings?.whatsappEnabled !== false && mobile && whatsappMessage) {
      sendNotification(mobile, whatsappMessage);
    }
  } catch (error) {
    console.error('Notification service error:', error);
  }
};

module.exports = { sendNotifications };