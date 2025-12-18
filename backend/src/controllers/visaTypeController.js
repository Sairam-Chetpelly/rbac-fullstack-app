const VisaType = require('../models/VisaType');

const getVisaTypes = async (req, res) => {
  try {
    let query = { deletedAt: null };
    
    // Add search filter if provided
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Add isActive filter if provided
    if (req.query.isActive !== undefined) {
      const filterValue = req.query.isActive === 'true';
      if (filterValue) {
        const activeQuery = [{ isActive: true }, { isActive: { $exists: false } }];
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: activeQuery }];
          delete query.$or;
        } else {
          query.$or = activeQuery;
        }
      } else {
        query.isActive = false;
      }
    } else {
      const activeQuery = [{ isActive: true }, { isActive: { $exists: false } }];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: activeQuery }];
        delete query.$or;
      } else {
        query.$or = activeQuery;
      }
    }
    
    const visaTypes = await VisaType.find(query);
    // Ensure isActive field exists for all visa types
    const updatedVisaTypes = visaTypes.map(visaType => ({
      ...visaType.toObject(),
      isActive: visaType.isActive !== undefined ? visaType.isActive : true
    }));
    res.json(updatedVisaTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVisaType = async (req, res) => {
  try {
    const visaType = new VisaType(req.body);
    await visaType.save();
    res.status(201).json(visaType);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateVisaType = async (req, res) => {
  try {
    const visaType = await VisaType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!visaType) return res.status(404).json({ message: 'Visa type not found 2' });
    res.json(visaType);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const getVisaTypeById = async (req, res) => {
  try {
    const visaType = await VisaType.findOne({ _id: req.params.id, deletedAt: null });
    if (!visaType) return res.status(404).json({ message: 'Visa type not found' });
    
    const updatedVisaType = {
      ...visaType.toObject(),
      isActive: visaType.isActive !== undefined ? visaType.isActive : true
    };
    res.json(updatedVisaType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVisaType = async (req, res) => {
  try {
    const visaType = await VisaType.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    if (!visaType) return res.status(404).json({ message: 'Visa type not found' });
    res.json({ message: 'Visa type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVisaTypes, getVisaTypeById, createVisaType, updateVisaType, deleteVisaType };