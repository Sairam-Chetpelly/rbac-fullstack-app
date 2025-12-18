const express = require('express');
const router = express.Router();
const formFieldController = require('../controllers/formFieldController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require authentication and admin role
router.use(auth);
router.use(role(['admin']));

// GET /api/form-fields/country-visa-types/:countryId (must be before /:id)
router.get('/country-visa-types/:countryId', formFieldController.getCountryVisaTypesByCountry);

// GET /api/form-fields/form-sections/:countryVisaTypeId (must be before /:id)
router.get('/form-sections/:countryVisaTypeId', formFieldController.getFormSectionsByCountryVisaType);

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