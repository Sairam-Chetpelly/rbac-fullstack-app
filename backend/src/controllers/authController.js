const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const Status = require('../models/Status');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../utils/email');
const { sendEmail } = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
  
  // Calculate expiration time in milliseconds
  const expiresIn = process.env.JWT_EXPIRE;
  let expirationTime;
  
  if (expiresIn.includes('m')) {
    const minutes = parseInt(expiresIn.replace('m', ''));
    expirationTime = Date.now() + (minutes * 60 * 1000);
  } else if (expiresIn.includes('h')) {
    const hours = parseInt(expiresIn.replace('h', ''));
    expirationTime = Date.now() + (hours * 60 * 60 * 1000);
  } else if (expiresIn.includes('d')) {
    const days = parseInt(expiresIn.replace('d', ''));
    expirationTime = Date.now() + (days * 24 * 60 * 60 * 1000);
  } else {
    // Default to 15 minutes if format is unclear
    expirationTime = Date.now() + (15 * 60 * 1000);
  }
  
  return { accessToken, refreshToken, expirationTime };
};

const register = async (req, res) => {
  try {
    const { name, email, password, mobile, nationality } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get default customer role and active status
    const customerRole = await Role.findOne({ name: 'customer' });
    const activeStatus = await Status.findOne({ name: 'active' });
    
    if (!customerRole || !activeStatus) {
      return res.status(500).json({ message: 'Default role or status not found' });
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      mobile, 
      nationality,
      role: customerRole._id,
      status: activeStatus._id
    });
    await user.save();
    
    const populatedUser = await User.findById(user._id).populate('role').populate('status');
    
    // Send welcome email
    await sendEmail(email, 'welcome', { userName: name });
    
    res.status(201).json({
      message: 'Registration successful',
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).populate('role').populate('status');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status.name !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    const { accessToken, refreshToken, expirationTime } = generateTokens(user._id);
    
    res.json({
      message: 'Login successful',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role.name, 
        status: user.status.name 
      },
      accessToken,
      refreshToken,
      expirationTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).populate('status');
    
    if (!user || user.status.name !== 'active') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken, expirationTime } = generateTokens(user._id);
    
    res.json({ accessToken, refreshToken: newRefreshToken, expirationTime });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save reset token
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
    await passwordReset.save();

    // Send email using new service
    await sendEmail(email, 'forgotPassword', { userName: user.name, resetToken });
    
    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const passwordReset = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    }).populate('userId');
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update user password
    const user = passwordReset.userId;
    user.password = password;
    await user.save();

    // Delete the reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, refresh, forgotPassword, resetPassword };