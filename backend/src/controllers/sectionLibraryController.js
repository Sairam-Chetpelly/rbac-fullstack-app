const SectionLibrary = require('../models/SectionLibrary');
const FormSection = require('../models/FormSection');
const FormField = require('../models/FormField');
const Status = require('../models/Status');

// Get all library sections
const getLibrarySections = async (req, res) => {
  try {
    const sections = await SectionLibrary.find()
      .populate('createdBy', 'name email')
      .sort({ category: 1, name: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save section to library
const saveSectionToLibrary = async (req, res) => {
  try {
    const { sectionId, category, description } = req.body;
    
    const formSection = await FormSection.findById(sectionId);
    if (!formSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Get all fields for this section
    const fields = await FormField.find({ formSection: sectionId }).sort({ order: 1 });
    
    const libraryFields = fields.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder,
      defaultValue: field.defaultValue,
      required: field.required,
      options: field.options,
      validationRules: field.validationRules,
      order: field.order
    }));
    
    const librarySection = new SectionLibrary({
      name: formSection.name,
      description: description || formSection.description,
      category: category || 'General',
      fields: libraryFields,
      createdBy: req.user._id
    });
    
    await librarySection.save();
    res.status(201).json(librarySection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create section from library
const createSectionFromLibrary = async (req, res) => {
  try {
    const { librarySectionId, visaId, order } = req.body;
    
    const librarySection = await SectionLibrary.findById(librarySectionId);
    if (!librarySection) {
      return res.status(404).json({ message: 'Library section not found' });
    }
    
    const activeStatus = await Status.findOne({ name: 'active', category: 'System' });
    if (!activeStatus) {
      return res.status(404).json({ message: 'Active status not found' });
    }
    
    // Create the section
    const newSection = new FormSection({
      name: librarySection.name,
      description: librarySection.description,
      order: order || 1,
      countryVisaType: visaId,
      status: activeStatus._id
    });
    
    await newSection.save();
    
    // Get existing field names in the visa to ensure uniqueness
    const allSections = await FormSection.find({ countryVisaType: visaId });
    const sectionIds = allSections.map(s => s._id);
    const existingFields = await FormField.find({ formSection: { $in: sectionIds } });
    const existingNames = existingFields.map(f => f.name);
    
    // Create fields for this section
    for (const libraryField of librarySection.fields) {
      // Generate unique name
      let uniqueName = libraryField.name;
      let counter = 1;
      while (existingNames.includes(uniqueName)) {
        uniqueName = `${libraryField.name}_${counter}`;
        counter++;
      }
      existingNames.push(uniqueName);
      
      const newField = new FormField({
        name: uniqueName,
        label: libraryField.label,
        type: libraryField.type,
        placeholder: libraryField.placeholder,
        defaultValue: libraryField.defaultValue,
        required: libraryField.required,
        options: libraryField.options,
        validationRules: libraryField.validationRules,
        order: libraryField.order,
        formSection: newSection._id,
        status: activeStatus._id
      });
      
      await newField.save();
    }
    
    // Increment usage count
    librarySection.usageCount += 1;
    await librarySection.save();
    
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete library section
const deleteLibrarySection = async (req, res) => {
  try {
    const section = await SectionLibrary.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Library section not found' });
    }
    
    if (req.user.role !== 'admin' && section.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to delete this section' });
    }
    
    await SectionLibrary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Library section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLibrarySections,
  saveSectionToLibrary,
  createSectionFromLibrary,
  deleteLibrarySection
};