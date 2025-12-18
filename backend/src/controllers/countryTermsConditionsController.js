const CountryTermsConditions = require('../models/CountryTermsConditions');

const getCountryTermsConditions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, country, isActive } = req.query;
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
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (country) {
      query.country = country;
    }
    
    const total = await CountryTermsConditions.countDocuments(query);
    const terms = await CountryTermsConditions.find(query)
      .populate('country')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      data: terms,
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

const getCountryTermsConditionsById = async (req, res) => {
  try {
    const terms = await CountryTermsConditions.findOne({ _id: req.params.id, deletedAt: null }).populate('country');
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
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
    const terms = await CountryTermsConditions.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true }
    ).populate('country');
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCountryTermsConditions = async (req, res) => {
  try {
    const terms = await CountryTermsConditions.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json({ message: 'Terms deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCountryTermsConditions, getCountryTermsConditionsById, createCountryTermsConditions, updateCountryTermsConditions, deleteCountryTermsConditions };