const CountryVisaType = require('../models/CountryVisaType');

const getCountryVisaTypes = async (req, res) => {
  try {
    const countryVisaTypes = await CountryVisaType.find().populate(['status', 'visaType', 'country']);
    res.json(countryVisaTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = new CountryVisaType(req.body);
    await countryVisaType.save();
    await countryVisaType.populate(['status', 'visaType', 'country']);
    res.status(201).json(countryVisaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = await CountryVisaType.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['status', 'visaType', 'country']);
    if (!countryVisaType) return res.status(404).json({ message: 'Country visa type not found' });
    res.json(countryVisaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = await CountryVisaType.findByIdAndDelete(req.params.id);
    if (!countryVisaType) return res.status(404).json({ message: 'Country visa type not found' });
    res.json({ message: 'Country visa type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountryVisaTypes, createCountryVisaType, updateCountryVisaType, deleteCountryVisaType };