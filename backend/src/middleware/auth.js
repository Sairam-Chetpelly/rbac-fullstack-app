const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').populate('role');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or inactive user.' });
    }

    // Add role name for easier access
    req.user = {
      ...user.toObject(),
      role: user.role.name
    };
    console.log('Auth middleware - User ID:', req.user._id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;