const CountryTermsConditions = require('../models/CountryTermsConditions');

const getCountryTermsConditions = async (req, res) => {
  try {
    const terms = await CountryTermsConditions.find().populate('country');
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCountryTermsConditions = async (req, res) => {
  try {
    const terms = new CountryTermsConditions(req.body);
    await terms.save();
    await terms.populate('country');
    res.status(201).json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCountryTermsConditions = async (req, res) => {
  try {
    const terms = await CountryTermsConditions.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('country');
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCountryTermsConditions = async (req, res) => {
  try {
    const terms = await CountryTermsConditions.findByIdAndDelete(req.params.id);
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json({ message: 'Terms deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountryTermsConditions, createCountryTermsConditions, updateCountryTermsConditions, deleteCountryTermsConditions };