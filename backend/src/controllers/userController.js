const User = require('../models/User');
const Role = require('../models/Role');
const Status = require('../models/Status');

const getUsers = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      query.role = 'customer';
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    
    // Validate role exists
    const roleExists = await Role.findOne({ name: role, isActive: true });
    if (!roleExists) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Validate status exists
    const statusExists = await Status.findOne({ name: status, isActive: true });
    if (!statusExists) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Role-based creation restrictions
    if (req.user.role === 'employee' && role !== 'customer') {
      return res.status(403).json({ message: 'Employees can only create customers' });
    }
    
    if (req.user.role === 'manager' && !['employee', 'customer'].includes(role)) {
      return res.status(403).json({ message: 'Managers can only create employees and customers' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password, role, status });
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Role-based update restrictions
    if (req.user.role === 'employee') {
      const user = await User.findById(id);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ message: 'Employees can only edit customers' });
      }
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };