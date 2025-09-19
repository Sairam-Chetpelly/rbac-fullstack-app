const express = require('express');
const { getCountries, createCountry, updateCountry, deleteCountry } = require('../controllers/countryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getCountries);
router.post('/', auth, role(['admin']), createCountry);
router.put('/:id', auth, role(['admin']), updateCountry);
router.delete('/:id', auth, role(['admin']), deleteCountry);

module.exports = router;