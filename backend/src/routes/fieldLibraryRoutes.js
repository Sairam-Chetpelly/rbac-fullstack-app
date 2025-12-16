const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getLibraryFields,
  saveFieldToLibrary,
  createFieldFromLibrary,
  deleteLibraryField
} = require('../controllers/fieldLibraryController');

router.get('/', auth, role(['admin', 'manager']), getLibraryFields);
router.post('/save-field', auth, role(['admin', 'manager']), saveFieldToLibrary);
router.post('/create-field', auth, role(['admin', 'manager']), createFieldFromLibrary);
router.delete('/:id', auth, role(['admin', 'manager']), deleteLibraryField);

module.exports = router;