const express = require('express');
const { getCountryTermsConditions, createCountryTermsConditions, updateCountryTermsConditions, deleteCountryTermsConditions } = require('../controllers/countryTermsConditionsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getCountryTermsConditions);
router.post('/', auth, role(['admin']), createCountryTermsConditions);
router.put('/:id', auth, role(['admin']), updateCountryTermsConditions);
router.delete('/:id', auth, role(['admin']), deleteCountryTermsConditions);

module.exports = router;