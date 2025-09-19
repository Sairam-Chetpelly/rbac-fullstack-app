const express = require('express');
const router = express.Router();
const formSectionController = require('../controllers/formSectionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require authentication and admin role
router.use(auth);
router.use(role(['admin']));

// GET /api/form-sections
router.get('/', formSectionController.getFormSections);

// GET /api/form-sections/:id
router.get('/:id', formSectionController.getFormSectionById);

// POST /api/form-sections
router.post('/', formSectionController.createFormSection);

// PUT /api/form-sections/:id
router.put('/:id', formSectionController.updateFormSection);

// DELETE /api/form-sections/:id
router.delete('/:id', formSectionController.deleteFormSection);

module.exports = router;