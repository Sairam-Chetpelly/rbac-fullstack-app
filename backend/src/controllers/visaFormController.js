const FormSection = require('../models/FormSection');
const FormField = require('../models/FormField');
const CountryVisaType = require('../models/CountryVisaType');

// Get form sections and fields for form builder (includes inactive)
exports.getVisaForm = async (req, res) => {
  try {
    const { visaId } = req.params;
    
    const visa = await CountryVisaType.findById(visaId).populate('country visaType');
    if (!visa) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    const sections = await FormSection.find({ 
      countryVisaType: visaId
    })
      .populate('countryVisaType')
      .sort({ order: 1 });
    
    const sectionIds = sections.map(section => section._id);
    const fields = await FormField.find({ 
      formSection: { $in: sectionIds }
    })
      .populate('formSection')
      .sort({ order: 1 });

    res.json({
      visa,
      sections,
      fields
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active form sections and fields for visa application
exports.getActiveVisaForm = async (req, res) => {
  try {
    const { visaId } = req.params;
    
    const visa = await CountryVisaType.findById(visaId).populate('country visaType');
    if (!visa) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    const sections = await FormSection.find({ 
      countryVisaType: visaId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    })
      .populate('countryVisaType')
      .sort({ order: 1 });
    
    const sectionIds = sections.map(section => section._id);
    const fields = await FormField.find({ 
      formSection: { $in: sectionIds },
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    })
      .populate('formSection')
      .sort({ order: 1 });

    res.json({
      visa,
      sections,
      fields
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};