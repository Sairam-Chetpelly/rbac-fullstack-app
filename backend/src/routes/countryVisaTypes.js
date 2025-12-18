const express = require('express');
const { getCountryVisaTypes, getCountryVisaTypeById, createCountryVisaType, updateCountryVisaType, deleteCountryVisaType } = require('../controllers/countryVisaTypeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getCountryVisaTypes);
router.get('/:id', auth, role(['admin']), getCountryVisaTypeById);
router.post('/', auth, role(['admin']), createCountryVisaType);
router.put('/:id', auth, role(['admin']), updateCountryVisaType);
router.delete('/:id', auth, role(['admin']), deleteCountryVisaType);

module.exports = router;