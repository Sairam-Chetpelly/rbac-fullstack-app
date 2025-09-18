const express = require('express');
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin', 'manager']), getRoles);
router.post('/', auth, role(['admin']), createRole);
router.put('/:id', auth, role(['admin']), updateRole);
router.delete('/:id', auth, role(['admin']), deleteRole);

module.exports = router;