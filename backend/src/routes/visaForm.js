const express = require('express');
const router = express.Router();
const visaFormController = require('../controllers/visaFormController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/visa-form/:visaId - Public endpoint for form preview
router.get('/:visaId', visaFormController.getVisaForm);

module.exports = router;