const FormField = require('../models/FormField');
const FormSection = require('../models/FormSection');

// Get all form fields
exports.getFormFields = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, formSection, isActive, type, country, countryVisaType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { deletedAt: null };
    
    if (isActive !== undefined) {
      query.$or = [
        { isActive: isActive === 'true' },
        { isActive: { $exists: false } }
      ];
    } else {
      query.$or = [
        { isActive: true },
        { isActive: { $exists: false } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (formSection) {
      query.formSection = formSection;
    }
    
    if (countryVisaType) {
      const formSections = await FormSection.find({ countryVisaType }).select('_id');
      query.formSection = { $in: formSections.map(fs => fs._id) };
    }
    
    if (country) {
      const CountryVisaType = require('../models/CountryVisaType');
      const countryVisaTypes = await CountryVisaType.find({ country }).select('_id');
      const formSections = await FormSection.find({ countryVisaType: { $in: countryVisaTypes.map(cvt => cvt._id) } }).select('_id');
      query.formSection = { $in: formSections.map(fs => fs._id) };
    }
    
    const total = await FormField.countDocuments(query);
    const formFields = await FormField.find(query)
      .populate({
        path: 'formSection',
        populate: {
          path: 'countryVisaType',
          populate: {
            path: 'country'
          }
        }
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      data: formFields,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form field by ID
exports.getFormFieldById = async (req, res) => {
  try {
    const formField = await FormField.findOne({ _id: req.params.id, deletedAt: null })
      .populate({
        path: 'formSection',
        populate: {
          path: 'countryVisaType',
          populate: {
            path: 'country visaType'
          }
        }
      });
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
    const populatedFormField = await FormField.findById(savedFormField._id).populate('formSection');
    res.status(201).json(populatedFormField);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update form field
exports.updateFormField = async (req, res) => {
  try {
    const currentField = await FormField.findOne({ _id: req.params.id, deletedAt: null }).populate('formSection');
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
        _id: { $ne: req.params.id },
        deletedAt: null
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
    
    const formField = await FormField.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    ).populate('formSection');
    
    res.json(formField);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete form field
exports.deleteFormField = async (req, res) => {
  try {
    const formField = await FormField.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!formField) {
      return res.status(404).json({ message: 'Form field not found' });
    }
    res.json({ message: 'Form field deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get country visa types by country
exports.getCountryVisaTypesByCountry = async (req, res) => {
  try {
    const CountryVisaType = require('../models/CountryVisaType');
    const countryVisaTypes = await CountryVisaType.find({
      country: req.params.countryId,
      deletedAt: null,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).select('_id name').sort({ name: 1 });
    res.json(countryVisaTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form sections by country visa type
exports.getFormSectionsByCountryVisaType = async (req, res) => {
  try {
    const formSections = await FormSection.find({
      countryVisaType: req.params.countryVisaTypeId,
      deletedAt: null,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).select('_id name order').sort({ order: 1 });
    res.json(formSections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};