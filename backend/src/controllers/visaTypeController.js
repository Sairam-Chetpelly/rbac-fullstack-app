const VisaType = require('../models/VisaType');

const getVisaTypes = async (req, res) => {
  try {
    const visaTypes = await VisaType.find({ deletedAt: null }).populate('status');
    res.json(visaTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVisaType = async (req, res) => {
  try {
    const visaType = new VisaType(req.body);
    await visaType.save();
    await visaType.populate('status');
    res.status(201).json(visaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVisaType = async (req, res) => {
  try {
    const visaType = await VisaType.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('status');
    if (!visaType) return res.status(404).json({ message: 'Visa type not found' });
    res.json(visaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

module.exports = { getVisaTypes, createVisaType, updateVisaType, deleteVisaType };