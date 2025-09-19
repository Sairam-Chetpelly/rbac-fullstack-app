const express = require('express');
const router = express.Router();
const formFieldController = require('../controllers/formFieldController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require authentication and admin role
router.use(auth);
router.use(role(['admin']));

// GET /api/form-fields
router.get('/', formFieldController.getFormFields);

// GET /api/form-fields/:id
router.get('/:id', formFieldController.getFormFieldById);

// POST /api/form-fields
router.post('/', formFieldController.createFormField);

// PUT /api/form-fields/:id
router.put('/:id', formFieldController.updateFormField);

// DELETE /api/form-fields/:id
router.delete('/:id', formFieldController.deleteFormField);

module.exports = router;