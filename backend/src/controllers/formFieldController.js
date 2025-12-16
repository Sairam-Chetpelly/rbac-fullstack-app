const FormField = require('../models/FormField');
const FormSection = require('../models/FormSection');

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
    // Get the section to find the visa type
    const section = await FormSection.findById(req.body.formSection);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Get all sections for this visa type
    const allSections = await FormSection.find({ countryVisaType: section.countryVisaType });
    const sectionIds = allSections.map(s => s._id);
    
    // Get all existing fields in the entire visa form to ensure unique names
    const existingFields = await FormField.find({ formSection: { $in: sectionIds } });
    const existingNames = existingFields.map(f => f.name);
    
    // Generate unique name if needed
    let uniqueName = req.body.name;
    let counter = 1;
    while (existingNames.includes(uniqueName)) {
      const baseName = req.body.name.replace(/_\d+$/, ''); // Remove existing counter
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    
    const formField = new FormField({
      ...req.body,
      name: uniqueName
    });
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
    const currentField = await FormField.findById(req.params.id).populate('formSection');
    if (!currentField) {
      return res.status(404).json({ message: 'Form field not found' });
    }
    
    // If name is being changed, ensure uniqueness
    if (req.body.name && req.body.name !== currentField.name) {
      // Get all sections for this visa type
      const allSections = await FormSection.find({ countryVisaType: currentField.formSection.countryVisaType });
      const sectionIds = allSections.map(s => s._id);
      
      // Get all existing fields except the current one
      const existingFields = await FormField.find({ 
        formSection: { $in: sectionIds },
        _id: { $ne: req.params.id }
      });
      const existingNames = existingFields.map(f => f.name);
      
      // Generate unique name if needed
      let uniqueName = req.body.name;
      let counter = 1;
      while (existingNames.includes(uniqueName)) {
        const baseName = req.body.name.replace(/_\d+$/, '');
        uniqueName = `${baseName}_${counter}`;
        counter++;
      }
      req.body.name = uniqueName;
    }
    
    const formField = await FormField.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('status formSection');
    
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