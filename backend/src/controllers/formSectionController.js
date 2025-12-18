const FormSection = require('../models/FormSection');

// Get all form sections
exports.getFormSections = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, countryVisaType, isActive, country } = req.query;
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
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (countryVisaType) {
      query.countryVisaType = countryVisaType;
    }
    
    if (country) {
      const CountryVisaType = require('../models/CountryVisaType');
      const countryVisaTypes = await CountryVisaType.find({ country }).select('_id');
      query.countryVisaType = { $in: countryVisaTypes.map(cvt => cvt._id) };
    }
    
    const total = await FormSection.countDocuments(query);
    const formSections = await FormSection.find(query)
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country'
        }
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      data: formSections,
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

// Get form section by ID
exports.getFormSectionById = async (req, res) => {
  try {
    const formSection = await FormSection.findOne({ _id: req.params.id, deletedAt: null })
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country'
        }
      });
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
    const populatedFormSection = await FormSection.findById(savedFormSection._id)
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country'
        }
      });
    res.status(201).json(populatedFormSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update form section
exports.updateFormSection = async (req, res) => {
  try {
    const formSection = await FormSection.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'countryVisaType',
      populate: {
        path: 'country'
      }
    });
    
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
    const formSection = await FormSection.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!formSection) {
      return res.status(404).json({ message: 'Form section not found' });
    }
    res.json({ message: 'Form section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};