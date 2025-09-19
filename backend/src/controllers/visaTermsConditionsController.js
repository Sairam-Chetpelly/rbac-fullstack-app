const VisaTermsConditions = require('../models/VisaTermsConditions');

const getVisaTermsConditions = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.find().populate(['countryVisaType', 'status']);
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVisaTermsConditions = async (req, res) => {
  try {
    const terms = new VisaTermsConditions(req.body);
    await terms.save();
    await terms.populate(['countryVisaType', 'status']);
    res.status(201).json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVisaTermsConditions = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['countryVisaType', 'status']);
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVisaTermsConditions = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.findByIdAndDelete(req.params.id);
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json({ message: 'Terms deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVisaTermsConditions, createVisaTermsConditions, updateVisaTermsConditions, deleteVisaTermsConditions };