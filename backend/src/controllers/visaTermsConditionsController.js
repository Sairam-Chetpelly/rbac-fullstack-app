const VisaTermsConditions = require('../models/VisaTermsConditions');

const getVisaTermsConditions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, countryVisaType, isActive, country } = req.query;
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
    
    if (countryVisaType) {
      query.countryVisaType = countryVisaType;
    }
    
    if (country) {
      const CountryVisaType = require('../models/CountryVisaType');
      const countryVisaTypes = await CountryVisaType.find({ country }).select('_id');
      query.countryVisaType = { $in: countryVisaTypes.map(cvt => cvt._id) };
    }
    
    const total = await VisaTermsConditions.countDocuments(query);
    const terms = await VisaTermsConditions.find(query)
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country'
        }
      })
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

const getVisaTermsConditionsById = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.findOne({ _id: req.params.id, deletedAt: null }).populate('countryVisaType');
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVisaTermsConditions = async (req, res) => {
  try {
    const terms = new VisaTermsConditions(req.body);
    await terms.save();
    await terms.populate('countryVisaType');
    res.status(201).json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVisaTermsConditions = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      req.body,
      { new: true }
    ).populate('countryVisaType');
    if (!terms) return res.status(404).json({ message: 'Terms not found' });
    res.json(terms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVisaTermsConditions = async (req, res) => {
  try {
    const terms = await VisaTermsConditions.findOneAndUpdate(
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

module.exports = { getVisaTermsConditions, getVisaTermsConditionsById, createVisaTermsConditions, updateVisaTermsConditions, deleteVisaTermsConditions };