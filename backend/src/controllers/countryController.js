const Country = require('../models/Country');
const fs = require('fs');
const path = require('path');

const getCountries = async (req, res) => {
  try {
    const countries = await Country.find({ deletedAt: null }).populate('continent').populate('status');
    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCountry = async (req, res) => {
  try {
    const countryData = { ...req.body };
    if (req.file) {
      countryData.placeImage = req.file.filename;
    }
    const country = new Country(countryData);
    await country.save();
    await country.populate(['continent', 'status']);
    res.status(201).json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCountry = async (req, res) => {
  try {
    const countryData = { ...req.body };
    
    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      const existingCountry = await Country.findById(req.params.id);
      if (existingCountry && existingCountry.placeImage) {
        const oldImagePath = path.join(__dirname, '../../uploads/countries', existingCountry.placeImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      countryData.placeImage = req.file.filename;
    }
    
    const country = await Country.findByIdAndUpdate(req.params.id, countryData, { new: true }).populate(['continent', 'status']);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json({ message: 'Country deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountries, createCountry, updateCountry, deleteCountry };