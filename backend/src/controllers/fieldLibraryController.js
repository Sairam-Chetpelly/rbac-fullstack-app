const FieldLibrary = require('../models/FieldLibrary');
const FormField = require('../models/FormField');
const FormSection = require('../models/FormSection');
const Status = require('../models/Status');

// Get all library fields
const getLibraryFields = async (req, res) => {
  try {
    const fields = await FieldLibrary.find()
      .populate('createdBy', 'name email')
      .sort({ category: 1, name: 1 });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save field to library
const saveFieldToLibrary = async (req, res) => {
  try {
    const { fieldId, category, description } = req.body;
    
    const formField = await FormField.findById(fieldId);
    if (!formField) {
      return res.status(404).json({ message: 'Field not found' });
    }
    
    const libraryField = new FieldLibrary({
      name: formField.name,
      label: formField.label,
      type: formField.type,
      placeholder: formField.placeholder,
      defaultValue: formField.defaultValue,
      required: formField.required,
      options: formField.options,
      validationRules: formField.validationRules,
      category: category || 'General',
      description: description || '',
      createdBy: req.user._id
    });
    
    await libraryField.save();
    res.status(201).json(libraryField);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create field from library
const createFieldFromLibrary = async (req, res) => {
  try {
    const { libraryFieldId, sectionId, order } = req.body;
    
    const libraryField = await FieldLibrary.findById(libraryFieldId);
    if (!libraryField) {
      return res.status(404).json({ message: 'Library field not found' });
    }
    
    const activeStatus = await Status.findOne({ name: 'active', category: 'System' });
    if (!activeStatus) {
      return res.status(404).json({ message: 'Active status not found' });
    }
    
    // Get the section to find the visa type
    const section = await FormSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Get all sections for this visa type
    const allSections = await FormSection.find({ countryVisaType: section.countryVisaType });
    const sectionIds = allSections.map(s => s._id);
    
    // Get all existing fields in the entire visa form to ensure unique names
    const existingFields = await FormField.find({ formSection: { $in: sectionIds } });
    const existingNames = existingFields.map(f => f.name);
    
    // Generate unique name
    let uniqueName = libraryField.name;
    let counter = 1;
    while (existingNames.includes(uniqueName)) {
      uniqueName = `${libraryField.name}_${counter}`;
      counter++;
    }
    
    const newField = new FormField({
      name: uniqueName,
      label: libraryField.label,
      type: libraryField.type,
      placeholder: libraryField.placeholder,
      defaultValue: libraryField.defaultValue,
      required: libraryField.required,
      options: libraryField.options,
      validationRules: libraryField.validationRules,
      order: order || 1,
      formSection: sectionId,
      status: activeStatus._id
    });
    
    await newField.save();
    
    // Increment usage count
    libraryField.usageCount += 1;
    await libraryField.save();
    
    res.status(201).json(newField);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete library field
const deleteLibraryField = async (req, res) => {
  try {
    const field = await FieldLibrary.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Library field not found' });
    }
    
    if (req.user.role !== 'admin' && field.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this field' });
    }
    
    await FieldLibrary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Library field deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLibraryFields,
  saveFieldToLibrary,
  createFieldFromLibrary,
  deleteLibraryField
};