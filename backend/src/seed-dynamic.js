const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Role = require('./models/Role');
const Status = require('./models/Status');
const Continent = require('./models/Continent');
const Country = require('./models/Country');
const VisaType = require('./models/VisaType');
const CountryVisaType = require('./models/CountryVisaType');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await Status.deleteMany({});
    await Continent.deleteMany({});
    await Country.deleteMany({});
    await VisaType.deleteMany({});
    await CountryVisaType.deleteMany({});

    // Create Roles
    const roles = await Role.insertMany([
      {
        name: 'admin',
        permissions: ['dashboard', 'roles', 'users', 'status', 'settings', 'continents', 'countries', 'visa-types', 'country-visa-types', 'country-terms-conditions', 'visa-terms-conditions'],
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

    // Create Continents
    const continents = await Continent.insertMany([
      {
        name: 'Asia',
        slug: 'asia',
        description: 'The largest continent',
        status: activeStatus._id
      },
      {
        name: 'Europe',
        slug: 'europe',
        description: 'The second smallest continent',
        status: activeStatus._id
      },
      {
        name: 'North America',
        slug: 'north-america',
        description: 'Third largest continent',
        status: activeStatus._id
      }
    ]);

    // Create Countries
    const asiaContinent = continents.find(c => c.name === 'Asia');
    const europeContinent = continents.find(c => c.name === 'Europe');
    
    const countries = await Country.insertMany([
      {
        name: 'India',
        slug: 'india',
        description: 'South Asian country',
        code: 'IN',
        flagEmoji: '🇮🇳',
        status: activeStatus._id,
        continent: asiaContinent._id,
        processingTimeMin: '5',
        processingTimeMax: '10'
      },
      {
        name: 'Germany',
        slug: 'germany',
        description: 'Central European country',
        code: 'DE',
        flagEmoji: '🇩🇪',
        status: activeStatus._id,
        continent: europeContinent._id,
        processingTimeMin: '3',
        processingTimeMax: '7'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Created:', roles.length, 'roles');
    console.log('📊 Created:', statuses.length, 'statuses');
    // Create Visa Types
    const visaTypes = await VisaType.insertMany([
      {
        name: 'Tourist Visa',
        description: 'For tourism and leisure travel',
        status: activeStatus._id
      },
      {
        name: 'Business Visa',
        description: 'For business meetings and conferences',
        status: activeStatus._id
      }
    ]);

    // Create Country Visa Types
    const touristVisa = visaTypes.find(v => v.name === 'Tourist Visa');
    const indiaCountry = countries.find(c => c.name === 'India');
    
    const countryVisaTypes = await CountryVisaType.insertMany([
      {
        name: 'India Tourist Visa',
        description: 'Tourist visa for India',
        status: activeStatus._id,
        visaType: touristVisa._id,
        country: indiaCountry._id,
        processingTimeMin: '3',
        processingTimeMax: '7',
        vfsAmount: '50',
        consulateAmount: '100',
        serviceAmount: '25',
        totalAmount: '175'
      }
    ]);

    console.log('📊 Created:', continents.length, 'continents');
    console.log('📊 Created:', countries.length, 'countries');
    console.log('📊 Created:', visaTypes.length, 'visa types');
    console.log('📊 Created:', countryVisaTypes.length, 'country visa types');
    console.log('👤 Created admin user: admin@example.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();