const express = require('express');
const { registerAgent, upload } = require('../controllers/agentController');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'panCardPhoto', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 }
]), registerAgent);

module.exports = router;