const whatsappService = require('../services/whatsappService');

const sendNotification = async (mobile, messageText, fileUrl = '') => {
  try {
    const result = await whatsappService.sendMessage(mobile, messageText, fileUrl);
    return result;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotification
};