const User = require('../models/User');
const Role = require('../models/Role');
const Status = require('../models/Status');
const { generateDefaultPassword } = require('../utils/passwordGenerator');
const { sendEmail } = require('../services/emailService');
const { sendNotifications } = require('../services/notificationService');

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
    const { name, email, role, status, mobile } = req.body;
    
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

    // Generate default password
    const defaultPassword = generateDefaultPassword();

    const user = new User({ 
      name, 
      email, 
      mobile,
      password: defaultPassword, 
      role: roleDoc._id, 
      status: statusDoc._id 
    });
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('role').populate('status');

    // Send welcome notifications with login credentials
    sendNotifications(email, mobile, 'accountCreated', {
      userName: name,
      email: email,
      password: defaultPassword
    }, 'accountCreated', {
      name: name,
      email: email,
      password: defaultPassword
    });

    res.status(201).json({
      message: 'User created successfully and welcome email sent',
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
    
    // Parse companyAddress if it's a string
    if (updates.companyAddress && typeof updates.companyAddress === 'string') {
      try {
        updates.companyAddress = JSON.parse(updates.companyAddress);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid company address format' });
      }
    }
    
    // Handle file uploads
    if (req.files) {
      if (req.files.panCardPhoto) {
        updates.panCardPhoto = req.files.panCardPhoto[0].filename;
      }
      if (req.files.gstFile) {
        updates.gstFile = req.files.gstFile[0].filename;
      }
      if (req.files.aadhaarFile) {
        updates.aadhaarFile = req.files.aadhaarFile[0].filename;
      }
      if (req.files.msmeFile) {
        updates.msmeFile = req.files.msmeFile[0].filename;
      }
      if (req.files.cancelledChequeFile) {
        updates.cancelledChequeFile = req.files.cancelledChequeFile[0].filename;
      }
    }
    
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

    // Get original user for comparison
    const originalUser = await User.findById(id).populate('status');
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password')
      .populate('role')
      .populate('status');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send email notifications for agent status changes
    if (user.isAgent && originalUser && originalUser.status && user.status) {
      const oldStatus = originalUser.status.name;
      const newStatus = user.status.name;
      
      if (oldStatus !== newStatus) {
        if (oldStatus === 'inactive' && newStatus === 'active') {
          // Agent activated
          sendNotifications(user.email, user.mobile, 'agentActivated', {
            userName: user.name,
            companyName: user.companyName
          }, 'agentActivated', {
            name: user.name,
            company: user.companyName
          });
        }
      }
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('role')
      .populate('status');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, nationality } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, mobile, nationality },
      { new: true }
    ).select('-password').populate('role').populate('status');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('status');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get active and inactive status
    const activeStatus = await Status.findOne({ name: 'active' });
    const inactiveStatus = await Status.findOne({ name: 'inactive' });
    
    if (!activeStatus || !inactiveStatus) {
      return res.status(500).json({ message: 'Status not found' });
    }

    // Toggle status
    const newStatus = user.status.name === 'active' ? inactiveStatus._id : activeStatus._id;
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { status: newStatus }, 
      { new: true }
    ).populate('role').populate('status');

    res.json({ 
      message: `User ${updatedUser.status.name === 'active' ? 'activated' : 'deactivated'} successfully`, 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, changePassword, getProfile, updateProfile, toggleUserStatus };