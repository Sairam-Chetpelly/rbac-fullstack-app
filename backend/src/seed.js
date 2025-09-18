require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Status = require('./models/Status');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await Status.deleteMany({});
    
    // Create default roles
    const roles = [
      { name: 'admin', permissions: ['dashboard', 'roles', 'users', 'status', 'settings'], description: 'Full system access' },
      { name: 'manager', permissions: ['dashboard', 'roles:view', 'users', 'status'], description: 'Management access' },
      { name: 'employee', permissions: ['users:customers'], description: 'Employee access' },
      { name: 'customer', permissions: ['dashboard'], description: 'Customer access' }
    ];
    
    await Role.insertMany(roles);
    console.log('Default roles created');
    
    // Create default statuses
    const statuses = [
      { name: 'active', description: 'User is active', color: 'green' },
      { name: 'inactive', description: 'User is inactive', color: 'red' },
      { name: 'pending', description: 'User is pending approval', color: 'yellow' }
    ];
    
    await Status.insertMany(statuses);
    console.log('Default statuses created');
    
    // Create default admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });
    
    await admin.save();
    console.log('Default admin created: admin@example.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();