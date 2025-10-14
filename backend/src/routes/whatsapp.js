const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Send WhatsApp message
router.post('/send', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const { mobile, messageText, fileUrl } = req.body;

    if (!mobile || !messageText) {
      return res.status(400).json({ error: 'Mobile number and message text are required' });
    }

    const result = await whatsappService.sendMessage(mobile, messageText, fileUrl);
    
    if (result.success) {
      res.json({ message: 'WhatsApp message sent successfully', data: result.data });
    } else {
      res.status(500).json({ error: 'Failed to send WhatsApp message', details: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;