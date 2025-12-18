const Country = require('../models/Country');
const fs = require('fs');
const path = require('path');

const getCountries = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, continent, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { deletedAt: null };
    
    if (isActive !== undefined) {
      if (isActive === 'true') {
        query.$or = [{ isActive: true }, { isActive: { $exists: false } }];
      } else {
        query.isActive = false;
      }
    } else {
      query.$or = [{ isActive: true }, { isActive: { $exists: false } }];
    }
    
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }
    
    if (continent) {
      query.continent = continent;
    }
    
    const total = await Country.countDocuments(query);
    const countries = await Country.find(query)
      .populate('continent')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const updatedCountries = countries.map(country => ({
      ...country.toObject(),
      isActive: country.isActive !== undefined ? country.isActive : true
    }));
    
    res.json({
      data: updatedCountries,
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

const getCountriesForDropdown = async (req, res) => {
  try {
    const countries = await Country.find({ 
      deletedAt: null,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).select('_id name').sort({ name: 1 });
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
    await country.populate('continent');
    res.status(201).json(country);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
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
    
    const country = await Country.findByIdAndUpdate(req.params.id, countryData, { new: true }).populate('continent');
    if (!country) return res.status(404).json({ message: 'Country not found' });
    res.json(country);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const getCountryById = async (req, res) => {
  try {
    const country = await Country.findOne({ _id: req.params.id, deletedAt: null }).populate('continent');
    if (!country) return res.status(404).json({ message: 'Country not found' });
    
    const updatedCountry = {
      ...country.toObject(),
      isActive: country.isActive !== undefined ? country.isActive : true
    };
    res.json(updatedCountry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    
    const timestamp = Date.now();
    const updatedCountry = await Country.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
      slug: `deleted-${timestamp}-${country.slug}`,
      code: `deleted-${timestamp}-${country.code}`
    }, { new: true });
    
    res.json({ message: 'Country deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountries, getCountriesForDropdown, getCountryById, createCountry, updateCountry, deleteCountry };