const express = require('express');
const { getContinents, createContinent, updateContinent, deleteContinent } = require('../controllers/continentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get('/', auth, role(['admin']), getContinents);
router.post('/', auth, role(['admin']), createContinent);
router.put('/:id', auth, role(['admin']), updateContinent);
router.delete('/:id', auth, role(['admin']), deleteContinent);

module.exports = router;