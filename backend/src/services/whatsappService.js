const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseUrl = process.env.WHATSAPP_BASE_URL || 'http://whatsapp.visionhlt.com/api/mt/SendMessage';
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.channelId = process.env.WHATSAPP_CHANNEL_ID;
  }

  async sendMessage(mobile, messageText, fileUrl = '') {
    try {
      // Format mobile number with country code
      const formattedMobile = mobile.startsWith('91') ? `91${mobile}` : `91${mobile}`;
      
      const url = `${this.baseUrl}?APIkey=${this.apiKey}&channelId=${this.channelId}&mobile=${formattedMobile}&messageText=${encodeURIComponent(messageText)}&fileurl=${fileUrl}`;
      
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('WhatsApp API Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WhatsAppService();