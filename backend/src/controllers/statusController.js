const User = require('../models/User');
const Status = require('../models/Status');

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const statusExists = await Status.findOne({ name: status, isActive: true });
    if (!statusExists) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({ isActive: true });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStatus = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const status = new Status({ name, description, color });
    await status.save();
    res.status(201).json({ message: 'Status created successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const status = await Status.findByIdAndUpdate(id, updates, { new: true });
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserStatus, getStatuses, createStatus, updateStatus, deleteStatus };