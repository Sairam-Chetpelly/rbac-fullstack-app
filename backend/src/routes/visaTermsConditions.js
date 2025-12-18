const express = require('express');
const { getVisaTermsConditions, getVisaTermsConditionsById, createVisaTermsConditions, updateVisaTermsConditions, deleteVisaTermsConditions } = require('../controllers/visaTermsConditionsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getVisaTermsConditions);
router.get('/:id', auth, role(['admin']), getVisaTermsConditionsById);
router.post('/', auth, role(['admin']), createVisaTermsConditions);
router.put('/:id', auth, role(['admin']), updateVisaTermsConditions);
router.delete('/:id', auth, role(['admin']), deleteVisaTermsConditions);

module.exports = router;