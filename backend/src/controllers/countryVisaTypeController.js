const CountryVisaType = require('../models/CountryVisaType');

const getCountryVisaTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, country, visaType, isActive } = req.query;
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
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }
    
    if (country) {
      query.country = country;
    }
    
    if (visaType) {
      query.visaType = visaType;
    }
    
    const total = await CountryVisaType.countDocuments(query);
    const countryVisaTypes = await CountryVisaType.find(query)
      .populate(['visaType', 'country'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const updatedCountryVisaTypes = countryVisaTypes.map(cvt => ({
      ...cvt.toObject(),
      isActive: cvt.isActive !== undefined ? cvt.isActive : true
    }));
    
    res.json({
      data: updatedCountryVisaTypes,
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

const createCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = new CountryVisaType(req.body);
    await countryVisaType.save();
    await countryVisaType.populate(['visaType', 'country']);
    res.status(201).json(countryVisaType);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = await CountryVisaType.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['visaType', 'country']);
    if (!countryVisaType) return res.status(404).json({ message: 'Country visa type not found' });
    res.json(countryVisaType);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const getCountryVisaTypeById = async (req, res) => {
  try {
    const countryVisaType = await CountryVisaType.findOne({ _id: req.params.id, deletedAt: null })
      .populate(['visaType', 'country']);
    if (!countryVisaType) return res.status(404).json({ message: 'Country visa type not found' });
    
    const updatedCountryVisaType = {
      ...countryVisaType.toObject(),
      isActive: countryVisaType.isActive !== undefined ? countryVisaType.isActive : true
    };
    res.json(updatedCountryVisaType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCountryVisaType = async (req, res) => {
  try {
    const countryVisaType = await CountryVisaType.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!countryVisaType) return res.status(404).json({ message: 'Country visa type not found' });
    res.json({ message: 'Country visa type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountryVisaTypes, getCountryVisaTypeById, createCountryVisaType, updateCountryVisaType, deleteCountryVisaType };