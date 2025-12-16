const express = require('express');
const { updateUserStatus, getStatuses, getStatusById, createStatus, updateStatus, deleteStatus } = require('../controllers/statusController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin', 'manager']), getStatuses);
router.get('/:id', auth, role(['admin', 'manager']), getStatusById);
router.post('/', auth, role(['admin']), createStatus);
router.put('/:id', auth, role(['admin']), updateStatus);
router.delete('/:id', auth, role(['admin']), deleteStatus);
router.put('/user/:id', auth, role(['admin', 'manager']), updateUserStatus);

module.exports = router;