const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseUrl = 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
    this.authKey = process.env.MSG91_AUTH_KEY;
  }

  async sendMessage(mobile, templateName, variables = {}) {
    try {
      const formattedMobile = `91${mobile}`;
      
      console.log('Variables received:', variables);
      
      // Build components dynamically based on variables
      const components = {};
      const variableValues = Object.values(variables);
      variableValues.forEach((value, index) => {
        if (value !== undefined && value !== null) {
          components[`body_${index + 1}`] = {
            type: 'text',
            value: String(value)
          };
        }
      });

      const payload = {
        integrated_number: process.env.MSG91_WHATSAPP_NUMBER || '15558659734',
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp',
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en',
              policy: 'deterministic'
            },
            namespace: process.env.MSG91_NAMESPACE || '42410526_5f3c_4bbb_ae41_4b5df00f4636',
            to_and_components: [
              {
                to: [formattedMobile],
                components: components
              }
            ]
          }
        }
      };
      console.log('WhatsApp Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json'
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('MSG91 WhatsApp API Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Template-based message functions
  async sendWelcomeMessage(mobile, userName) {
    return this.sendMessage(mobile, 'register_wellcome', { userName });
  }

  // async sendAccountCreatedMessage(mobile, name, email, password) {
  //   return this.sendMessage(mobile, 'oneworldvisa_account_created', { name, email, password });
  // }

  // async sendPasswordResetMessage(mobile, name, url, token) {
  //   return this.sendMessage(mobile, 'oneworldvisa_password_reset', { name, url, token });
  // }

  async sendDraftSavedMessage(mobile, name, appId) {
    return this.sendMessage(mobile, 'oneworldvisa_draft_saved', { name, appId });
  }

  async sendApplicationSubmittedMessage(mobile, name, appId) {
    return this.sendMessage(mobile, 'oneworldvisa_application_submitted', { name, appId });
  }

  async sendStatusUpdateMessage(mobile, name, appId, status, remarks = '') {
    return this.sendMessage(mobile, 'status_update', { name, appId, status, remarks });
  }

  async sendPaymentConfirmedMessage(mobile, name, amount, appId) {
    return this.sendMessage(mobile, 'oneworldvisa_payment_confirmed', { name, amount, appId });
  }

  // async sendAgentAssignedMessage(mobile, name, agentName, appId, email, agentMobile) {
  //   return this.sendMessage(mobile, 'oneworldvisa_agent_assigned', { name, agentName, appId, email, agentMobile });
  // }

  async sendEmbassyScheduledMessage(mobile, name, appId, dateTime) {
    return this.sendMessage(mobile, 'oneworldvisa_embassy_scheduled', { name, appId, dateTime });
  }

  async sendEmbassyReminderMessage(mobile, name, appId, dateTime, timeLeft) {
    return this.sendMessage(mobile, 'oneworldvisa_embassy_reminder', { name, appId, dateTime, timeLeft });
  }

  async sendVisaApprovedMessage(mobile, name, country, appId, visaNo, expiry) {
    return this.sendMessage(mobile, 'oneworldvisa_visa_approved', { name, country, appId, visaNo, expiry });
  }

  async sendVisaInTransitMessage(mobile, name, appId, courier, trackingNo) {
    return this.sendMessage(mobile, 'oneworldvisa_visa_in_transit', { name, appId, courier, trackingNo });
  }

  // async sendNewApplicationAlertMessage(mobile, appId, name, contact) {
  //   return this.sendMessage(mobile, 'oneworldvisa_new_application_alert', { appId, name, contact });
  // }

  async sendAgentRegistrationMessage(mobile, name, company) {
    return this.sendMessage(mobile, 'oneworldvisa_agent_registration', { name, company });
  }

  async sendAgentActivatedMessage(mobile, name, company) {
    return this.sendMessage(mobile, 'oneworldvisa_agent_activated', { name, company });
  }
}

module.exports = new WhatsAppService();