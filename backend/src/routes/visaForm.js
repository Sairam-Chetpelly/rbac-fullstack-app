const express = require('express');
const router = express.Router();
const visaFormController = require('../controllers/visaFormController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/visa-form/:visaId - For form builder (includes inactive)
router.get('/:visaId', visaFormController.getVisaForm);

// GET /api/visa-form/active/:visaId - For visa application (active only)
router.get('/active/:visaId', visaFormController.getActiveVisaForm);

module.exports = router;