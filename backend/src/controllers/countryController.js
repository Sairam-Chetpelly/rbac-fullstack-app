const Country = require('../models/Country');

const getCountries = async (req, res) => {
  try {
    const countries = await Country.find().populate('continent').populate('status');
    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCountry = async (req, res) => {
  try {
    const country = new Country(req.body);
    await country.save();
    await country.populate(['continent', 'status']);
    res.status(201).json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['continent', 'status']);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json({ message: 'Country deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountries, createCountry, updateCountry, deleteCountry };