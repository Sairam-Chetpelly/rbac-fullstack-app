const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, changePassword, getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin', 'manager', 'employee']), getUsers);
router.post('/', auth, role(['admin', 'manager', 'employee']), createUser);
router.put('/change-password', auth, changePassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/:id', auth, role(['admin', 'manager', 'employee']), updateUser);
router.delete('/:id', auth, role(['admin']), deleteUser);

module.exports = router;