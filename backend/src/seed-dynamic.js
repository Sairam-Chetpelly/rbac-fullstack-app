const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Role = require('./models/Role');
const Status = require('./models/Status');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await Status.deleteMany({});

    // Create Roles
    const roles = await Role.insertMany([
      {
        name: 'admin',
        permissions: ['dashboard', 'roles', 'users', 'status', 'settings'],
        description: 'Full system access',
        isActive: true
      },
      {
        name: 'manager',
        permissions: ['dashboard', 'users', 'status'],
        description: 'Manage users and status',
        isActive: true
      },
      {
        name: 'employee',
        permissions: ['users'],
        description: 'Manage customers only',
        isActive: true
      },
      {
        name: 'customer',
        permissions: ['dashboard'],
        description: 'View dashboard only',
        isActive: true
      }
    ]);

    // Create Statuses
    const statuses = await Status.insertMany([
      {
        name: 'active',
        description: 'User is active and can access the system',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'inactive',
        description: 'User is inactive and cannot access the system',
        color: '#EF4444',
        isActive: true
      },
      {
        name: 'pending',
        description: 'User registration is pending approval',
        color: '#F59E0B',
        isActive: true
      }
    ]);

    // Create default admin user
    const adminRole = roles.find(r => r.name === 'admin');
    const activeStatus = statuses.find(s => s.name === 'active');

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      mobile: '+1234567890',
      nationality: 'USA',
      role: adminRole._id,
      status: activeStatus._id
    });

    await adminUser.save();

    console.log('✅ Database seeded successfully!');
    console.log('📊 Created:', roles.length, 'roles');
    console.log('📊 Created:', statuses.length, 'statuses');
    console.log('👤 Created admin user: admin@example.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();