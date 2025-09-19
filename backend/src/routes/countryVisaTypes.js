const express = require('express');
const { getCountryVisaTypes, createCountryVisaType, updateCountryVisaType, deleteCountryVisaType } = require('../controllers/countryVisaTypeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getCountryVisaTypes);
router.post('/', auth, role(['admin']), createCountryVisaType);
router.put('/:id', auth, role(['admin']), updateCountryVisaType);
router.delete('/:id', auth, role(['admin']), deleteCountryVisaType);

module.exports = router;