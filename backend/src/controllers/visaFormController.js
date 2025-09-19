const FormSection = require('../models/FormSection');
const FormField = require('../models/FormField');
const CountryVisaType = require('../models/CountryVisaType');

// Get form sections and fields for a specific visa type
exports.getVisaForm = async (req, res) => {
  try {
    const { visaId } = req.params;
    
    // Verify visa exists
    const visa = await CountryVisaType.findById(visaId).populate('country visaType');
    if (!visa) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    // Get form sections for this specific visa type
    const sections = await FormSection.find({ countryVisaType: visaId })
      .populate('status countryVisaType')
      .sort({ order: 1 });
    
    // Get form fields for sections of this visa type
    const sectionIds = sections.map(section => section._id);
    const fields = await FormField.find({ formSection: { $in: sectionIds } })
      .populate('status formSection')
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