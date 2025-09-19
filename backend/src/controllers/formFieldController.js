const FormField = require('../models/FormField');

// Get all form fields
exports.getFormFields = async (req, res) => {
  try {
    const formFields = await FormField.find().populate('status formSection');
    res.json(formFields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form field by ID
exports.getFormFieldById = async (req, res) => {
  try {
    const formField = await FormField.findById(req.params.id).populate('status formSection');
    if (!formField) {
      return res.status(404).json({ message: 'Form field not found' });
    }
    res.json(formField);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create form field
exports.createFormField = async (req, res) => {
  try {
    const formField = new FormField(req.body);
    const savedFormField = await formField.save();
    const populatedFormField = await FormField.findById(savedFormField._id).populate('status formSection');
    res.status(201).json(populatedFormField);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update form field
exports.updateFormField = async (req, res) => {
  try {
    const formField = await FormField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('status formSection');
    
    if (!formField) {
      return res.status(404).json({ message: 'Form field not found' });
    }
    res.json(formField);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete form field
exports.deleteFormField = async (req, res) => {
  try {
    const formField = await FormField.findByIdAndDelete(req.params.id);
    if (!formField) {
      return res.status(404).json({ message: 'Form field not found' });
    }
    res.json({ message: 'Form field deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};