const FormSection = require('../models/FormSection');

// Get all form sections
exports.getFormSections = async (req, res) => {
  try {
    const formSections = await FormSection.find().populate('status');
    res.json(formSections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form section by ID
exports.getFormSectionById = async (req, res) => {
  try {
    const formSection = await FormSection.findById(req.params.id).populate('status');
    if (!formSection) {
      return res.status(404).json({ message: 'Form section not found' });
    }
    res.json(formSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create form section
exports.createFormSection = async (req, res) => {
  try {
    const formSection = new FormSection(req.body);
    const savedFormSection = await formSection.save();
    const populatedFormSection = await FormSection.findById(savedFormSection._id).populate('status');
    res.status(201).json(populatedFormSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update form section
exports.updateFormSection = async (req, res) => {
  try {
    const formSection = await FormSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('status');
    
    if (!formSection) {
      return res.status(404).json({ message: 'Form section not found' });
    }
    res.json(formSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete form section
exports.deleteFormSection = async (req, res) => {
  try {
    const formSection = await FormSection.findByIdAndDelete(req.params.id);
    if (!formSection) {
      return res.status(404).json({ message: 'Form section not found' });
    }
    res.json({ message: 'Form section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};