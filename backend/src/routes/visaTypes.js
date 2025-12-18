const express = require('express');
const { getVisaTypes, getVisaTypeById, createVisaType, updateVisaType, deleteVisaType } = require('../controllers/visaTypeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getVisaTypes);
router.get('/:id', auth, role(['admin']), getVisaTypeById);
router.post('/', auth, role(['admin']), createVisaType);
router.put('/:id', auth, role(['admin']), updateVisaType);
router.delete('/:id', auth, role(['admin']), deleteVisaType);

module.exports = router;