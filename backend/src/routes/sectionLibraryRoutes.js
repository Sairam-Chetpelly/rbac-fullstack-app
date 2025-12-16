const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getLibrarySections,
  saveSectionToLibrary,
  createSectionFromLibrary,
  deleteLibrarySection
} = require('../controllers/sectionLibraryController');

router.get('/', auth, role(['admin', 'manager']), getLibrarySections);
router.post('/save-section', auth, role(['admin', 'manager']), saveSectionToLibrary);
router.post('/create-section', auth, role(['admin', 'manager']), createSectionFromLibrary);
router.delete('/:id', auth, role(['admin', 'manager']), deleteLibrarySection);

module.exports = router;