const User = require('../models/User');
const Role = require('../models/Role');
const Status = require('../models/Status');

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      const customerRole = await Role.findOne({ name: 'customer' });
      if (customerRole) {
        query.role = customerRole._id;
      }
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('role')
      .populate('status')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    
    // Find role and status by ID or name
    const roleDoc = await Role.findOne({ 
      $or: [{ _id: role }, { name: role }], 
      isActive: true 
    });
    if (!roleDoc) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const statusDoc = await Status.findOne({ 
      $or: [{ _id: status }, { name: status }], 
      isActive: true 
    });
    if (!statusDoc) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Role-based creation restrictions
    if (req.user.role === 'employee' && roleDoc.name !== 'customer') {
      return res.status(403).json({ message: 'Employees can only create customers' });
    }
    
    if (req.user.role === 'manager' && !['employee', 'customer'].includes(roleDoc.name)) {
      return res.status(403).json({ message: 'Managers can only create employees and customers' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      role: roleDoc._id, 
      status: statusDoc._id 
    });
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('role').populate('status');

    res.status(201).json({
      message: 'User created successfully',
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role.name, 
        status: populatedUser.status.name 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Convert role and status names to IDs if provided
    if (updates.role) {
      const roleDoc = await Role.findOne({ 
        $or: [{ _id: updates.role }, { name: updates.role }], 
        isActive: true 
      });
      if (roleDoc) {
        updates.role = roleDoc._id;
      }
    }
    
    if (updates.status) {
      const statusDoc = await Status.findOne({ 
        $or: [{ _id: updates.status }, { name: updates.status }], 
        isActive: true 
      });
      if (statusDoc) {
        updates.status = statusDoc._id;
      }
    }
    
    // Role-based update restrictions
    if (req.user.role === 'employee') {
      const user = await User.findById(id).populate('role');
      if (!user || user.role.name !== 'customer') {
        return res.status(403).json({ message: 'Employees can only edit customers' });
      }
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password')
      .populate('role')
      .populate('status');
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