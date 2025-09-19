const express = require('express');
const router = express.Router();
const FormSection = require('../models/FormSection');
const FormField = require('../models/FormField');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get form sections and fields for a country visa type
router.get('/:countryVisaTypeId', auth, async (req, res) => {
  try {
    const sections = await FormSection.find({ 
      countryVisaType: req.params.countryVisaTypeId 
    }).populate('status').sort({ order: 1 });

    const sectionsWithFields = await Promise.all(
      sections.map(async (section) => {
        const fields = await FormField.find({ 
          formSection: section._id 
        }).populate('status').sort({ order: 1 });
        return { ...section.toObject(), fields };
      })
    );

    res.json(sectionsWithFields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update section order
router.put('/sections/reorder', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const { sections } = req.body;
    
    const updatePromises = sections.map((section, index) => 
      FormSection.findByIdAndUpdate(section._id, { order: index + 1 })
    );
    
    await Promise.all(updatePromises);
    res.json({ message: 'Section order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update field order within a section
router.put('/fields/reorder', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const { fields } = req.body;
    
    const updatePromises = fields.map((field, index) => 
      FormField.findByIdAndUpdate(field._id, { order: index + 1 })
    );
    
    await Promise.all(updatePromises);
    res.json({ message: 'Field order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete section
router.delete('/sections/:id', auth, role(['admin']), async (req, res) => {
  try {
    // Delete all fields in the section first
    await FormField.deleteMany({ formSection: req.params.id });
    
    // Delete the section
    await FormSection.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Section and its fields deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete field
router.delete('/fields/:id', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    await FormField.findByIdAndDelete(req.params.id);
    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new field
router.post('/fields', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const field = new FormField(req.body);
    await field.save();
    await field.populate('status');
    res.status(201).json(field);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update field
router.put('/fields/:id', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const field = await FormField.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('status');
    
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    res.json(field);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;