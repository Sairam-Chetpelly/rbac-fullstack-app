const express = require('express');
const router = express.Router();
const NotificationSettings = require('../models/NotificationSettings');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get notification settings
router.get('/', auth, role(['admin']), async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne();
    if (!settings) {
      settings = new NotificationSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update notification settings
router.put('/', auth, role(['admin']), async (req, res) => {
  try {
    const { emailEnabled, whatsappEnabled } = req.body;
    
    let settings = await NotificationSettings.findOne();
    if (!settings) {
      settings = new NotificationSettings();
    }
    
    settings.emailEnabled = emailEnabled;
    settings.whatsappEnabled = whatsappEnabled;
    settings.updatedBy = req.user._id;
    
    await settings.save();
    res.json({ message: 'Notification settings updated', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;