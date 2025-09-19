const express = require('express');
const Country = require('../models/Country');
const Continent = require('../models/Continent');
const CountryVisaType = require('../models/CountryVisaType');

const router = express.Router();

// Get countries for home page (public)
router.get('/countries', async (req, res) => {
  try {
    const countries = await Country.find()
      .populate('continent', 'name')
      .populate('status', 'name')
      .lean();

    // Get visa types for each country
    const countriesWithVisaTypes = await Promise.all(
      countries.map(async (country) => {
        const visaTypes = await CountryVisaType.find({ country: country._id })
          .populate('visaType', 'name')
          .lean();

        return {
          id: country._id,
          name: country.name,
          code: country.code,
          flag_emoji: country.flagEmoji,
          flagEmoji: country.flagEmoji,
          continent: country.continent?.name,
          region: country.continent?.name,
          processing_time_min: country.processingTimeMin,
          processing_time_max: country.processingTimeMax,
          processingTimeMin: country.processingTimeMin,
          processingTimeMax: country.processingTimeMax,
          visa_types: visaTypes.map(vt => ({
            id: vt._id,
            name: vt.name,
            fee: parseFloat(vt.totalAmount) || 0
          }))
        };
      })
    );

    res.json(countriesWithVisaTypes);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries', error: error.message });
  }
});

// Get continents for home page (public)
router.get('/continents', async (req, res) => {
  try {
    const continents = await Continent.find()
      .populate('status', 'name')
      .lean();

    const continentNames = continents.map(continent => continent.name);
    res.json(['All', ...continentNames]);
  } catch (error) {
    console.error('Error fetching continents:', error);
    res.status(500).json({ message: 'Error fetching continents', error: error.message });
  }
});

// Get single country (public)
router.get('/countries/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id)
      .populate('continent', 'name')
      .populate('status', 'name')
      .lean();

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    res.json({
      id: country._id,
      name: country.name,
      code: country.code,
      flagEmoji: country.flagEmoji,
      continent: country.continent?.name,
      processingTimeMin: country.processingTimeMin,
      processingTimeMax: country.processingTimeMax
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ message: 'Error fetching country', error: error.message });
  }
});

// Get visa types for a country (public)
router.get('/countries/:id/visa-types', async (req, res) => {
  try {
    const visaTypes = await CountryVisaType.find({ country: req.params.id })
      .populate('visaType', 'name')
      .populate('status', 'name')
      .lean();

    const formattedVisaTypes = visaTypes.map(vt => ({
      _id: vt._id,
      name: vt.name,
      description: vt.description,
      processingTimeMin: vt.processingTimeMin,
      processingTimeMax: vt.processingTimeMax,
      vfsAmount: vt.vfsAmount,
      consulateAmount: vt.consulateAmount,
      serviceAmount: vt.serviceAmount,
      totalAmount: vt.totalAmount
    }));

    res.json(formattedVisaTypes);
  } catch (error) {
    console.error('Error fetching visa types:', error);
    res.status(500).json({ message: 'Error fetching visa types', error: error.message });
  }
});

// Get visa type details (public)
router.get('/visa-types/:id', async (req, res) => {
  try {
    const visaType = await CountryVisaType.findById(req.params.id)
      .populate('country', 'name flagEmoji')
      .populate('visaType', 'name')
      .lean();

    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }

    res.json({
      visaType: {
        _id: visaType._id,
        name: visaType.name,
        description: visaType.description,
        processingTimeMin: visaType.processingTimeMin,
        processingTimeMax: visaType.processingTimeMax,
        vfsAmount: visaType.vfsAmount,
        consulateAmount: visaType.consulateAmount,
        serviceAmount: visaType.serviceAmount,
        totalAmount: visaType.totalAmount
      },
      country: visaType.country
    });
  } catch (error) {
    console.error('Error fetching visa type:', error);
    res.status(500).json({ message: 'Error fetching visa type', error: error.message });
  }
});

// Get terms and conditions for visa type (public)
router.get('/visa-types/:id/terms-conditions', async (req, res) => {
  try {
    const VisaTermsConditions = require('../models/VisaTermsConditions');
    const CountryTermsConditions = require('../models/CountryTermsConditions');
    
    // Get visa type details to find the country
    const visaType = await CountryVisaType.findById(req.params.id)
      .populate('country', 'name')
      .lean();
    
    if (!visaType) {
      return res.status(404).json({ message: 'Visa type not found' });
    }
    
    // Get visa-specific terms and conditions
    const visaTerms = await VisaTermsConditions.find({ countryVisaType: req.params.id })
      .lean();
    
    // Get country-specific terms and conditions
    const countryTerms = await CountryTermsConditions.find({ country: visaType.country._id })
      .lean();
    
    // Combine both types of terms
    const allTerms = [
      ...visaTerms.map(term => ({
        _id: term._id,
        title: term.title,
        content: term.content,
        type: 'visa-specific'
      })),
      ...countryTerms.map(term => ({
        _id: term._id,
        title: term.title,
        content: term.content,
        type: 'country-general'
      }))
    ];
    
    console.log(`Found ${allTerms.length} terms and conditions for visa type ${req.params.id}`);
    
    res.json(allTerms);
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    res.status(500).json({ message: 'Error fetching terms and conditions', error: error.message });
  }
});

// Get form fields for visa type (public)
router.get('/visa-types/:id/form', async (req, res) => {
  try {
    const FormSection = require('../models/FormSection');
    const FormField = require('../models/FormField');
    
    // Find sections for this specific visa type
    const sections = await FormSection.find({ countryVisaType: req.params.id })
      .sort({ order: 1 })
      .lean();
    
    // Find fields for these sections
    const sectionIds = sections.map(section => section._id);
    const fields = await FormField.find({ formSection: { $in: sectionIds } })
      .sort({ order: 1 })
      .lean();
    
    console.log(`Found ${sections.length} sections and ${fields.length} fields for visa type ${req.params.id}`);
    
    res.json({ sections, fields });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ message: 'Error fetching form data', error: error.message });
  }
});

// Submit visa application (public)
router.post('/visa-applications', async (req, res) => {
  try {
    const { visaTypeId, ...formData } = req.body;
    
    // Create a simple application record
    const application = {
      id: `VA${Date.now().toString().slice(-6)}`,
      visaTypeId,
      formData,
      status: 'submitted',
      submittedAt: new Date(),
      applicationNumber: `APP-${Date.now()}`
    };
    
    console.log('Visa application submitted:', application.id);
    
    res.json({ 
      success: true, 
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      message: 'Application submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting visa application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Save visa application draft (public)
router.post('/visa-applications/draft', async (req, res) => {
  try {
    const { visaTypeId, formData } = req.body;
    
    // Create a simple draft record
    const draft = {
      id: `DRAFT${Date.now().toString().slice(-6)}`,
      visaTypeId,
      formData,
      status: 'draft',
      savedAt: new Date()
    };
    
    console.log('Visa application draft saved:', draft.id);
    
    res.json({ 
      success: true, 
      draftId: draft.id,
      message: 'Draft saved successfully' 
    });
  } catch (error) {
    console.error('Error saving visa application draft:', error);
    res.status(500).json({ message: 'Error saving draft', error: error.message });
  }
});

module.exports = router;