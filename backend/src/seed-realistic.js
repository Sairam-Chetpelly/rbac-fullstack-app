const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Role = require('./models/Role');
const Status = require('./models/Status');
const Continent = require('./models/Continent');
const Country = require('./models/Country');
const VisaType = require('./models/VisaType');
const CountryVisaType = require('./models/CountryVisaType');
const CountryTermsConditions = require('./models/CountryTermsConditions');
const VisaTermsConditions = require('./models/VisaTermsConditions');
const FormSection = require('./models/FormSection');
const FormField = require('./models/FormField');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Status.deleteMany({}),
      Continent.deleteMany({}),
      Country.deleteMany({}),
      VisaType.deleteMany({}),
      CountryVisaType.deleteMany({}),
      CountryTermsConditions.deleteMany({}),
      VisaTermsConditions.deleteMany({}),
      FormSection.deleteMany({}),
      FormField.deleteMany({})
    ]);

    // 1. Create Statuses
    const roles = await Role.insertMany([
      {
        name: 'admin',
        permissions: ['dashboard', 'roles', 'users', 'status', 'settings', 'continents', 'countries', 'visa-types', 'country-visa-types', 'country-terms-conditions', 'visa-terms-conditions', 'applications'],
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
      // General System Statuses
      {
        name: 'active',
        description: 'Active and operational',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'inactive',
        description: 'Inactive or disabled',
        color: '#EF4444',
        isActive: true
      },
      {
        name: 'pending',
        description: 'Pending approval or processing',
        color: '#F59E0B',
        isActive: true
      },
      // Application Statuses
      {
        name: 'draft',
        description: 'Application saved as draft',
        color: '#6B7280',
        isActive: true
      },
      {
        name: 'submitted',
        description: 'Application submitted for review',
        color: '#3B82F6',
        isActive: true
      },
      {
        name: 'under-review',
        description: 'Application under review',
        color: '#8B5CF6',
        isActive: true
      },
      {
        name: 'documents-required',
        description: 'Additional documents required',
        color: '#F97316',
        isActive: true
      },
      {
        name: 'interview-scheduled',
        description: 'Interview scheduled',
        color: '#06B6D4',
        isActive: true
      },
      {
        name: 'approved',
        description: 'Application approved',
        color: '#059669',
        isActive: true
      },
      {
        name: 'rejected',
        description: 'Application rejected',
        color: '#DC2626',
        isActive: true
      },
      {
        name: 'cancelled',
        description: 'Application cancelled',
        color: '#9CA3AF',
        isActive: true
      },
      // Payment Statuses
      {
        name: 'payment-pending',
        description: 'Payment pending',
        color: '#FBBF24',
        isActive: true
      },
      {
        name: 'payment-completed',
        description: 'Payment completed successfully',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'payment-failed',
        description: 'Payment failed',
        color: '#EF4444',
        isActive: true
      },
      {
        name: 'refunded',
        description: 'Payment refunded',
        color: '#6366F1',
        isActive: true
      },
      // Document Statuses
      {
        name: 'document-uploaded',
        description: 'Document uploaded',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'document-verified',
        description: 'Document verified',
        color: '#059669',
        isActive: true
      },
      {
        name: 'document-rejected',
        description: 'Document rejected',
        color: '#DC2626',
        isActive: true
      },
      // Processing Statuses
      {
        name: 'in-progress',
        description: 'Currently in progress',
        color: '#3B82F6',
        isActive: true
      },
      {
        name: 'on-hold',
        description: 'Processing on hold',
        color: '#F59E0B',
        isActive: true
      },
      {
        name: 'completed',
        description: 'Process completed',
        color: '#10B981',
        isActive: true
      },
      // User Account Statuses
      {
        name: 'verified',
        description: 'Account verified',
        color: '#10B981',
        isActive: true
      },
      {
        name: 'suspended',
        description: 'Account suspended',
        color: '#EF4444',
        isActive: true
      },
      {
        name: 'blocked',
        description: 'Account blocked',
        color: '#7F1D1D',
        isActive: true
      },
      // Visa Statuses
      {
        name: 'visa-applied',
        description: 'Visa applied successfully',
        color: '#8fd4d2ff',
        isActive: true
      },
      {
        name: 'visa-issued',
        description: 'Visa issued successfully',
        color: '#059669',
        isActive: true
      },
      {
        name: 'visa-expired',
        description: 'Visa has expired',
        color: '#9CA3AF',
        isActive: true
      },
      {
        name: 'visa-cancelled',
        description: 'Visa cancelled',
        color: '#DC2626',
        isActive: true
      }
    ]);

    // 3. Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await User.insertMany([
      { name: 'Administrator', email: 'admin@optiontravel.com', mobile: '7757915697', password: hashedPassword, role: roles[0]._id, status: statuses[0]._id }
    ]);

    // 4. Create Continents
    const continents = await Continent.insertMany([
      { name: 'Asia', slug: 'asia', description: 'The largest continent', status: statuses[0]._id },
      { name: 'Europe', slug: 'europe', description: 'A continent of rich history', status: statuses[0]._id },
      { name: 'North America', slug: 'north-america', description: 'Northern part of Americas', status: statuses[0]._id },
      { name: 'South America', slug: 'south-america', description: 'Southern part of Americas', status: statuses[0]._id },
      { name: 'Africa', slug: 'africa', description: 'Second largest continent', status: statuses[0]._id },
      { name: 'Oceania', slug: 'oceania', description: 'Australia and Pacific islands', status: statuses[0]._id },
      { name: 'Antarctica', slug: 'antarctica', description: 'The coldest and driest continent', status: statuses[0]._id }
    ]);

    // 5. Create Countries
    // 5. Create Countries
    const countries = await Country.insertMany([
      // Asia (48 countries)
      { name: 'Afghanistan', slug: 'afghanistan', description: 'Country in South Asia', code: 'AF', continent: continents[0]._id, processingTimeMin: '4 weeks', processingTimeMax: '12 weeks', status: statuses[0]._id },
      { name: 'Armenia', slug: 'armenia', description: 'Country in the South Caucasus', code: 'AM', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Azerbaijan', slug: 'azerbaijan', description: 'Country in the South Caucasus', code: 'AZ', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Bahrain', slug: 'bahrain', description: 'Island country in the Persian Gulf', code: 'BH', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Bangladesh', slug: 'bangladesh', description: 'Country in South Asia', code: 'BD', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Bhutan', slug: 'bhutan', description: 'Country in the Eastern Himalayas', code: 'BT', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Brunei', slug: 'brunei', description: 'Country on the island of Borneo', code: 'BN', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Cambodia', slug: 'cambodia', description: 'Country in Southeast Asia', code: 'KH', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'China', slug: 'china', description: 'Country in East Asia', code: 'CN', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Cyprus', slug: 'cyprus', description: 'Island country in the Eastern Mediterranean', code: 'CY', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Georgia', slug: 'georgia', description: 'Country in the Caucasus region', code: 'GE', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'India', slug: 'india', description: 'Country in South Asia', code: 'IN', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Indonesia', slug: 'indonesia', description: 'Country in Southeast Asia', code: 'ID', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Iran', slug: 'iran', description: 'Country in Western Asia', code: 'IR', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Iraq', slug: 'iraq', description: 'Country in Western Asia', code: 'IQ', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Israel', slug: 'israel', description: 'Country in Western Asia', code: 'IL', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Japan', slug: 'japan', description: 'Island country in East Asia', code: 'JP', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Jordan', slug: 'jordan', description: 'Country in Western Asia', code: 'JO', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Kazakhstan', slug: 'kazakhstan', description: 'Country in Central Asia', code: 'KZ', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Kuwait', slug: 'kuwait', description: 'Country in Western Asia', code: 'KW', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Kyrgyzstan', slug: 'kyrgyzstan', description: 'Country in Central Asia', code: 'KG', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Laos', slug: 'laos', description: 'Country in Southeast Asia', code: 'LA', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Lebanon', slug: 'lebanon', description: 'Country in Western Asia', code: 'LB', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Malaysia', slug: 'malaysia', description: 'Country in Southeast Asia', code: 'MY', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Maldives', slug: 'maldives', description: 'Island country in South Asia', code: 'MV', continent: continents[0]._id, processingTimeMin: '1 day', processingTimeMax: '1 week', status: statuses[0]._id },
      { name: 'Mongolia', slug: 'mongolia', description: 'Country in East Asia', code: 'MN', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Myanmar', slug: 'myanmar', description: 'Country in Southeast Asia', code: 'MM', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Nepal', slug: 'nepal', description: 'Country in South Asia', code: 'NP', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'North Korea', slug: 'north-korea', description: 'Country in East Asia', code: 'KP', continent: continents[0]._id, processingTimeMin: '4 weeks', processingTimeMax: '12 weeks', status: statuses[0]._id },
      { name: 'Oman', slug: 'oman', description: 'Country on the Arabian Peninsula', code: 'OM', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Pakistan', slug: 'pakistan', description: 'Country in South Asia', code: 'PK', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Palestine', slug: 'palestine', description: 'Territory in Western Asia', code: 'PS', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Philippines', slug: 'philippines', description: 'Island country in Southeast Asia', code: 'PH', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Qatar', slug: 'qatar', description: 'Country on the Arabian Peninsula', code: 'QA', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '1 week', status: statuses[0]._id },
      { name: 'Saudi Arabia', slug: 'saudi-arabia', description: 'Country on the Arabian Peninsula', code: 'SA', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Singapore', slug: 'singapore', description: 'City-state in Southeast Asia', code: 'SG', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '1 week', status: statuses[0]._id },
      { name: 'South Korea', slug: 'south-korea', description: 'Country in East Asia', code: 'KR', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Sri Lanka', slug: 'sri-lanka', description: 'Island country in South Asia', code: 'LK', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Syria', slug: 'syria', description: 'Country in Western Asia', code: 'SY', continent: continents[0]._id, processingTimeMin: '4 weeks', processingTimeMax: '12 weeks', status: statuses[0]._id },
      { name: 'Taiwan', slug: 'taiwan', description: 'Island in East Asia', code: 'TW', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Tajikistan', slug: 'tajikistan', description: 'Country in Central Asia', code: 'TJ', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Thailand', slug: 'thailand', description: 'Country in Southeast Asia', code: 'TH', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Timor-Leste', slug: 'timor-leste', description: 'Country in Southeast Asia', code: 'TL', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Turkey', slug: 'turkey', description: 'Country straddling Europe and Asia', code: 'TR', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Turkmenistan', slug: 'turkmenistan', description: 'Country in Central Asia', code: 'TM', continent: continents[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'United Arab Emirates', slug: 'united-arab-emirates', description: 'Country on the Arabian Peninsula', code: 'AE', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
      { name: 'Uzbekistan', slug: 'uzbekistan', description: 'Country in Central Asia', code: 'UZ', continent: continents[0]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Vietnam', slug: 'vietnam', description: 'Country in Southeast Asia', code: 'VN', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '3 weeks', status: statuses[0]._id },
      { name: 'Yemen', slug: 'yemen', description: 'Country on the Arabian Peninsula', code: 'YE', continent: continents[0]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },

      // Europe (44 countries)
      { name: 'Albania', slug: 'albania', description: 'Country in Southeast Europe', code: 'AL', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Andorra', slug: 'andorra', description: 'Microstate in the Pyrenees', code: 'AD', continent: continents[1]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Austria', slug: 'austria', description: 'Country in Central Europe', code: 'AT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Belarus', slug: 'belarus', description: 'Country in Eastern Europe', code: 'BY', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Belgium', slug: 'belgium', description: 'Country in Western Europe', code: 'BE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Bosnia and Herzegovina', slug: 'bosnia-herzegovina', description: 'Country in Southeast Europe', code: 'BA', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Bulgaria', slug: 'bulgaria', description: 'Country in Southeast Europe', code: 'BG', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Croatia', slug: 'croatia', description: 'Country in Southeast Europe', code: 'HR', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Czech Republic', slug: 'czech-republic', description: 'Country in Central Europe', code: 'CZ', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Denmark', slug: 'denmark', description: 'Country in Northern Europe', code: 'DK', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Estonia', slug: 'estonia', description: 'Country in Northern Europe', code: 'EE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Finland', slug: 'finland', description: 'Country in Northern Europe', code: 'FI', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'France', slug: 'france', description: 'Country in Western Europe', code: 'FR', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Germany', slug: 'germany', description: 'Country in Central Europe', code: 'DE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Greece', slug: 'greece', description: 'Country in Southeast Europe', code: 'GR', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Hungary', slug: 'hungary', description: 'Country in Central Europe', code: 'HU', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Iceland', slug: 'iceland', description: 'Island country in the North Atlantic', code: 'IS', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Ireland', slug: 'ireland', description: 'Island country in Northwestern Europe', code: 'IE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Italy', slug: 'italy', description: 'Country in Southern Europe', code: 'IT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '5 weeks', status: statuses[0]._id },
      { name: 'Kosovo', slug: 'kosovo', description: 'Country in Southeast Europe', code: 'XK', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Latvia', slug: 'latvia', description: 'Country in Northern Europe', code: 'LV', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Liechtenstein', slug: 'liechtenstein', description: 'Microstate in Central Europe', code: 'LI', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Lithuania', slug: 'lithuania', description: 'Country in Northern Europe', code: 'LT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Luxembourg', slug: 'luxembourg', description: 'Country in Western Europe', code: 'LU', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Malta', slug: 'malta', description: 'Island country in the Mediterranean', code: 'MT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Moldova', slug: 'moldova', description: 'Country in Eastern Europe', code: 'MD', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Monaco', slug: 'monaco', description: 'Microstate on the French Riviera', code: 'MC', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Montenegro', slug: 'montenegro', description: 'Country in Southeast Europe', code: 'ME', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Netherlands', slug: 'netherlands', description: 'Country in Western Europe', code: 'NL', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'North Macedonia', slug: 'north-macedonia', description: 'Country in Southeast Europe', code: 'MK', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Norway', slug: 'norway', description: 'Country in Northern Europe', code: 'NO', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Poland', slug: 'poland', description: 'Country in Central Europe', code: 'PL', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Portugal', slug: 'portugal', description: 'Country in Southwestern Europe', code: 'PT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Romania', slug: 'romania', description: 'Country in Southeast Europe', code: 'RO', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Russia', slug: 'russia', description: 'Transcontinental country', code: 'RU', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'San Marino', slug: 'san-marino', description: 'Microstate in Southern Europe', code: 'SM', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Serbia', slug: 'serbia', description: 'Country in Southeast Europe', code: 'RS', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Slovakia', slug: 'slovakia', description: 'Country in Central Europe', code: 'SK', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Slovenia', slug: 'slovenia', description: 'Country in Central Europe', code: 'SI', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Spain', slug: 'spain', description: 'Country in Southwestern Europe', code: 'ES', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Sweden', slug: 'sweden', description: 'Country in Northern Europe', code: 'SE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Switzerland', slug: 'switzerland', description: 'Country in Central Europe', code: 'CH', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Ukraine', slug: 'ukraine', description: 'Country in Eastern Europe', code: 'UA', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'United Kingdom', slug: 'united-kingdom', description: 'Sovereign country in Europe', code: 'GB', continent: continents[1]._id, processingTimeMin: '3 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Vatican City', slug: 'vatican-city', description: 'City-state in Rome', code: 'VA', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },

      // North America (23 countries)
      { name: 'Antigua and Barbuda', slug: 'antigua-barbuda', description: 'Island country in the Caribbean', code: 'AG', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Bahamas', slug: 'bahamas', description: 'Island country in the Caribbean', code: 'BS', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Barbados', slug: 'barbados', description: 'Island country in the Caribbean', code: 'BB', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Belize', slug: 'belize', description: 'Country in Central America', code: 'BZ', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Canada', slug: 'canada', description: 'Country in North America', code: 'CA', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '12 weeks', status: statuses[0]._id },
      { name: 'Costa Rica', slug: 'costa-rica', description: 'Country in Central America', code: 'CR', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Cuba', slug: 'cuba', description: 'Island country in the Caribbean', code: 'CU', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Dominica', slug: 'dominica', description: 'Island country in the Caribbean', code: 'DM', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Dominican Republic', slug: 'dominican-republic', description: 'Country in the Caribbean', code: 'DO', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'El Salvador', slug: 'el-salvador', description: 'Country in Central America', code: 'SV', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Grenada', slug: 'grenada', description: 'Island country in the Caribbean', code: 'GD', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Guatemala', slug: 'guatemala', description: 'Country in Central America', code: 'GT', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Haiti', slug: 'haiti', description: 'Country in the Caribbean', code: 'HT', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Honduras', slug: 'honduras', description: 'Country in Central America', code: 'HN', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Jamaica', slug: 'jamaica', description: 'Island country in the Caribbean', code: 'JM', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Mexico', slug: 'mexico', description: 'Country in North America', code: 'MX', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Nicaragua', slug: 'nicaragua', description: 'Country in Central America', code: 'NI', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Panama', slug: 'panama', description: 'Country in Central America', code: 'PA', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Saint Kitts and Nevis', slug: 'saint-kitts-nevis', description: 'Island country in the Caribbean', code: 'KN', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Saint Lucia', slug: 'saint-lucia', description: 'Island country in the Caribbean', code: 'LC', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Saint Vincent and the Grenadines', slug: 'saint-vincent-grenadines', description: 'Island country in the Caribbean', code: 'VC', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Trinidad and Tobago', slug: 'trinidad-tobago', description: 'Island country in the Caribbean', code: 'TT', continent: continents[2]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'United States', slug: 'united-states', description: 'Federal republic in North America', code: 'US', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },

      // South America (12 countries)
      { name: 'Argentina', slug: 'argentina', description: 'Country in South America', code: 'AR', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Bolivia', slug: 'bolivia', description: 'Landlocked country in South America', code: 'BO', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Brazil', slug: 'brazil', description: 'Largest country in South America', code: 'BR', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Chile', slug: 'chile', description: 'Country in South America', code: 'CL', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Colombia', slug: 'colombia', description: 'Country in South America', code: 'CO', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Ecuador', slug: 'ecuador', description: 'Country in South America', code: 'EC', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Guyana', slug: 'guyana', description: 'Country in South America', code: 'GY', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Paraguay', slug: 'paraguay', description: 'Landlocked country in South America', code: 'PY', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Peru', slug: 'peru', description: 'Country in South America', code: 'PE', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Suriname', slug: 'suriname', description: 'Country in South America', code: 'SR', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Uruguay', slug: 'uruguay', description: 'Country in South America', code: 'UY', continent: continents[3]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Venezuela', slug: 'venezuela', description: 'Country in South America', code: 'VE', continent: continents[3]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },

      // Africa (54 countries)
      { name: 'Algeria', slug: 'algeria', description: 'Country in North Africa', code: 'DZ', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Angola', slug: 'angola', description: 'Country in Central Africa', code: 'AO', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Benin', slug: 'benin', description: 'Country in West Africa', code: 'BJ', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Botswana', slug: 'botswana', description: 'Landlocked country in Southern Africa', code: 'BW', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Burkina Faso', slug: 'burkina-faso', description: 'Landlocked country in West Africa', code: 'BF', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Burundi', slug: 'burundi', description: 'Landlocked country in East Africa', code: 'BI', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Cabo Verde', slug: 'cabo-verde', description: 'Island country in West Africa', code: 'CV', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Cameroon', slug: 'cameroon', description: 'Country in Central Africa', code: 'CM', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Central African Republic', slug: 'central-african-republic', description: 'Landlocked country in Central Africa', code: 'CF', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Chad', slug: 'chad', description: 'Landlocked country in Central Africa', code: 'TD', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Comoros', slug: 'comoros', description: 'Island country in East Africa', code: 'KM', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Congo', slug: 'congo', description: 'Country in Central Africa', code: 'CG', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Democratic Republic of the Congo', slug: 'dr-congo', description: 'Country in Central Africa', code: 'CD', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Djibouti', slug: 'djibouti', description: 'Country in the Horn of Africa', code: 'DJ', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Egypt', slug: 'egypt', description: 'Transcontinental country', code: 'EG', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Equatorial Guinea', slug: 'equatorial-guinea', description: 'Country in Central Africa', code: 'GQ', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Eritrea', slug: 'eritrea', description: 'Country in the Horn of Africa', code: 'ER', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Eswatini', slug: 'eswatini', description: 'Landlocked country in Southern Africa', code: 'SZ', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Ethiopia', slug: 'ethiopia', description: 'Landlocked country in the Horn of Africa', code: 'ET', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Gabon', slug: 'gabon', description: 'Country in Central Africa', code: 'GA', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Gambia', slug: 'gambia', description: 'Country in West Africa', code: 'GM', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Ghana', slug: 'ghana', description: 'Country in West Africa', code: 'GH', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Guinea', slug: 'guinea', description: 'Country in West Africa', code: 'GN', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Guinea-Bissau', slug: 'guinea-bissau', description: 'Country in West Africa', code: 'GW', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Ivory Coast', slug: 'ivory-coast', description: 'Country in West Africa', code: 'CI', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Kenya', slug: 'kenya', description: 'Country in East Africa', code: 'KE', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Lesotho', slug: 'lesotho', description: 'Landlocked country in Southern Africa', code: 'LS', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Liberia', slug: 'liberia', description: 'Country in West Africa', code: 'LR', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Libya', slug: 'libya', description: 'Country in North Africa', code: 'LY', continent: continents[4]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Madagascar', slug: 'madagascar', description: 'Island country in East Africa', code: 'MG', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Malawi', slug: 'malawi', description: 'Landlocked country in Southeast Africa', code: 'MW', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Mali', slug: 'mali', description: 'Landlocked country in West Africa', code: 'ML', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Mauritania', slug: 'mauritania', description: 'Country in West Africa', code: 'MR', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Mauritius', slug: 'mauritius', description: 'Island country in East Africa', code: 'MU', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Morocco', slug: 'morocco', description: 'Country in North Africa', code: 'MA', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Mozambique', slug: 'mozambique', description: 'Country in Southeast Africa', code: 'MZ', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Namibia', slug: 'namibia', description: 'Country in Southern Africa', code: 'NA', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Niger', slug: 'niger', description: 'Landlocked country in West Africa', code: 'NE', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Nigeria', slug: 'nigeria', description: 'Country in West Africa', code: 'NG', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Rwanda', slug: 'rwanda', description: 'Landlocked country in East Africa', code: 'RW', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Sao Tome and Principe', slug: 'sao-tome-principe', description: 'Island country in Central Africa', code: 'ST', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Senegal', slug: 'senegal', description: 'Country in West Africa', code: 'SN', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Seychelles', slug: 'seychelles', description: 'Island country in East Africa', code: 'SC', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Sierra Leone', slug: 'sierra-leone', description: 'Country in West Africa', code: 'SL', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Somalia', slug: 'somalia', description: 'Country in the Horn of Africa', code: 'SO', continent: continents[4]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'South Africa', slug: 'south-africa', description: 'Country in Southern Africa', code: 'ZA', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'South Sudan', slug: 'south-sudan', description: 'Landlocked country in East Africa', code: 'SS', continent: continents[4]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Sudan', slug: 'sudan', description: 'Country in Northeast Africa', code: 'SD', continent: continents[4]._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
      { name: 'Tanzania', slug: 'tanzania', description: 'Country in East Africa', code: 'TZ', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Togo', slug: 'togo', description: 'Country in West Africa', code: 'TG', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Tunisia', slug: 'tunisia', description: 'Country in North Africa', code: 'TN', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Uganda', slug: 'uganda', description: 'Landlocked country in East Africa', code: 'UG', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Zambia', slug: 'zambia', description: 'Landlocked country in Southern Africa', code: 'ZM', continent: continents[4]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Zimbabwe', slug: 'zimbabwe', description: 'Landlocked country in Southern Africa', code: 'ZW', continent: continents[4]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },

      // Oceania (14 countries)
      { name: 'Australia', slug: 'australia', description: 'Country and continent in Oceania', code: 'AU', continent: continents[5]._id, processingTimeMin: '15 days', processingTimeMax: '4 months', status: statuses[0]._id },
      { name: 'Fiji', slug: 'fiji', description: 'Island country in Melanesia', code: 'FJ', continent: continents[5]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Kiribati', slug: 'kiribati', description: 'Island country in the Pacific', code: 'KI', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Marshall Islands', slug: 'marshall-islands', description: 'Island country in Micronesia', code: 'MH', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Micronesia', slug: 'micronesia', description: 'Island country in the Pacific', code: 'FM', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Nauru', slug: 'nauru', description: 'Island country in Micronesia', code: 'NR', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'New Zealand', slug: 'new-zealand', description: 'Island country in the Pacific', code: 'NZ', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Palau', slug: 'palau', description: 'Island country in Micronesia', code: 'PW', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Papua New Guinea', slug: 'papua-new-guinea', description: 'Country in Melanesia', code: 'PG', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Samoa', slug: 'samoa', description: 'Island country in Polynesia', code: 'WS', continent: continents[5]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Solomon Islands', slug: 'solomon-islands', description: 'Island country in Melanesia', code: 'SB', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Tonga', slug: 'tonga', description: 'Island country in Polynesia', code: 'TO', continent: continents[5]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id },
      { name: 'Tuvalu', slug: 'tuvalu', description: 'Island country in Polynesia', code: 'TV', continent: continents[5]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
      { name: 'Vanuatu', slug: 'vanuatu', description: 'Island country in Melanesia', code: 'VU', continent: continents[5]._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', status: statuses[0]._id }
    ]);

    // 6. Create Visa Types
    // 6. Create Visa Types
    const visaTypes = await VisaType.insertMany([
      // Tourism & Leisure
      { name: 'Tourist Visa', code: 'TOURIST', description: 'For tourism and leisure travel', status: statuses[0]._id },
      { name: 'Medical Visa', code: 'MEDICAL', description: 'For medical treatment purposes', status: statuses[0]._id },
      { name: 'Medical Attendant Visa', code: 'MEDICAL_ATTENDANT', description: 'For accompanying medical patients', status: statuses[0]._id },
      { name: 'Visitor Visa', code: 'VISITOR', description: 'For short-term visits', status: statuses[0]._id },

      // Business & Work
      { name: 'Business Visa', code: 'BUSINESS', description: 'For business activities and meetings', status: statuses[0]._id },
      { name: 'Work Visa', code: 'WORK', description: 'For employment purposes', status: statuses[0]._id },
      { name: 'Employment Visa', code: 'EMPLOYMENT', description: 'For long-term employment', status: statuses[0]._id },
      { name: 'Skilled Worker Visa', code: 'SKILLED_WORKER', description: 'For skilled professionals', status: statuses[0]._id },
      { name: 'Temporary Worker Visa', code: 'TEMP_WORKER', description: 'For temporary employment', status: statuses[0]._id },
      { name: 'Seasonal Worker Visa', code: 'SEASONAL_WORKER', description: 'For seasonal employment', status: statuses[0]._id },
      { name: 'Intra-Company Transfer Visa', code: 'ICT', description: 'For company transfers', status: statuses[0]._id },
      { name: 'Entrepreneur Visa', code: 'ENTREPRENEUR', description: 'For starting a business', status: statuses[0]._id },
      { name: 'Investor Visa', code: 'INVESTOR', description: 'For investment purposes', status: statuses[0]._id },
      { name: 'Start-up Visa', code: 'STARTUP', description: 'For innovative business ventures', status: statuses[0]._id },
      { name: 'Self-Employed Visa', code: 'SELF_EMPLOYED', description: 'For self-employment', status: statuses[0]._id },
      { name: 'Freelancer Visa', code: 'FREELANCER', description: 'For freelance work', status: statuses[0]._id },
      { name: 'Digital Nomad Visa', code: 'DIGITAL_NOMAD', description: 'For remote workers', status: statuses[0]._id },

      // Education
      { name: 'Student Visa', code: 'STUDENT', description: 'For academic studies', status: statuses[0]._id },
      { name: 'Student Dependent Visa', code: 'STUDENT_DEPENDENT', description: 'For student dependents', status: statuses[0]._id },
      { name: 'Exchange Visitor Visa', code: 'EXCHANGE', description: 'For exchange programs', status: statuses[0]._id },
      { name: 'Research Visa', code: 'RESEARCH', description: 'For research purposes', status: statuses[0]._id },
      { name: 'Internship Visa', code: 'INTERNSHIP', description: 'For internship programs', status: statuses[0]._id },
      { name: 'Training Visa', code: 'TRAINING', description: 'For training programs', status: statuses[0]._id },
      { name: 'Au Pair Visa', code: 'AU_PAIR', description: 'For au pair programs', status: statuses[0]._id },

      // Family & Residence
      { name: 'Family Visa', code: 'FAMILY', description: 'For family reunification', status: statuses[0]._id },
      { name: 'Spouse Visa', code: 'SPOUSE', description: 'For married partners', status: statuses[0]._id },
      { name: 'Partner Visa', code: 'PARTNER', description: 'For unmarried partners', status: statuses[0]._id },
      { name: 'Fiancé Visa', code: 'FIANCE', description: 'For engaged couples', status: statuses[0]._id },
      { name: 'Child Visa', code: 'CHILD', description: 'For dependent children', status: statuses[0]._id },
      { name: 'Parent Visa', code: 'PARENT', description: 'For parents of citizens/residents', status: statuses[0]._id },
      { name: 'Dependent Visa', code: 'DEPENDENT', description: 'For family dependents', status: statuses[0]._id },
      { name: 'Domestic Worker Visa', code: 'DOMESTIC_WORKER', description: 'For domestic workers', status: statuses[0]._id },

      // Transit & Short Stay
      { name: 'Transit Visa', code: 'TRANSIT', description: 'For transit through country', status: statuses[0]._id },
      { name: 'Airport Transit Visa', code: 'AIRPORT_TRANSIT', description: 'For airport transit only', status: statuses[0]._id },
      { name: 'Seaman Visa', code: 'SEAMAN', description: 'For maritime crew members', status: statuses[0]._id },
      { name: 'Crew Member Visa', code: 'CREW', description: 'For airline/ship crew', status: statuses[0]._id },

      // Long-term & Permanent
      { name: 'Permanent Residence Visa', code: 'PERMANENT_RESIDENCE', description: 'For permanent residency', status: statuses[0]._id },
      { name: 'Long-term Residence Visa', code: 'LONG_TERM', description: 'For extended stays', status: statuses[0]._id },
      { name: 'Retirement Visa', code: 'RETIREMENT', description: 'For retirees', status: statuses[0]._id },
      { name: 'Pensioner Visa', code: 'PENSIONER', description: 'For pensioners', status: statuses[0]._id },

      // Diplomatic & Official
      { name: 'Diplomatic Visa', code: 'DIPLOMATIC', description: 'For diplomatic personnel', status: statuses[0]._id },
      { name: 'Official Visa', code: 'OFFICIAL', description: 'For official government business', status: statuses[0]._id },
      { name: 'Service Visa', code: 'SERVICE', description: 'For service passport holders', status: statuses[0]._id },
      { name: 'Courtesy Visa', code: 'COURTESY', description: 'For courtesy visits', status: statuses[0]._id },

      // Special Categories
      { name: 'Journalist Visa', code: 'JOURNALIST', description: 'For media and press', status: statuses[0]._id },
      { name: 'Religious Worker Visa', code: 'RELIGIOUS', description: 'For religious activities', status: statuses[0]._id },
      { name: 'Missionary Visa', code: 'MISSIONARY', description: 'For missionary work', status: statuses[0]._id },
      { name: 'Volunteer Visa', code: 'VOLUNTEER', description: 'For volunteer work', status: statuses[0]._id },
      { name: 'Cultural Exchange Visa', code: 'CULTURAL', description: 'For cultural exchanges', status: statuses[0]._id },
      { name: 'Sports Visa', code: 'SPORTS', description: 'For athletes and sports events', status: statuses[0]._id },
      { name: 'Artist Visa', code: 'ARTIST', description: 'For artists and performers', status: statuses[0]._id },
      { name: 'Entertainment Visa', code: 'ENTERTAINMENT', description: 'For entertainment purposes', status: statuses[0]._id },
      { name: 'Film Visa', code: 'FILM', description: 'For film production', status: statuses[0]._id },
      { name: 'Conference Visa', code: 'CONFERENCE', description: 'For attending conferences', status: statuses[0]._id },

      // Refugee & Asylum
      { name: 'Refugee Visa', code: 'REFUGEE', description: 'For refugees', status: statuses[0]._id },
      { name: 'Asylum Visa', code: 'ASYLUM', description: 'For asylum seekers', status: statuses[0]._id },
      { name: 'Humanitarian Visa', code: 'HUMANITARIAN', description: 'For humanitarian purposes', status: statuses[0]._id },

      // Electronic & Special Entry
      { name: 'E-Visa', code: 'E_VISA', description: 'Electronic visa', status: statuses[0]._id },
      { name: 'Visa on Arrival', code: 'VISA_ON_ARRIVAL', description: 'Issued upon arrival', status: statuses[0]._id },
      { name: 'Electronic Travel Authorization', code: 'ETA', description: 'Electronic travel authorization', status: statuses[0]._id },
      { name: 'ESTA', code: 'ESTA', description: 'Electronic System for Travel Authorization', status: statuses[0]._id },
      { name: 'eTA', code: 'eTA', description: 'Electronic Travel Authority', status: statuses[0]._id },
      { name: 'Visa Waiver', code: 'VISA_WAIVER', description: 'Visa-free entry', status: statuses[0]._id },

      // Duration-based
      { name: 'Single Entry Visa', code: 'SINGLE_ENTRY', description: 'Valid for one entry', status: statuses[0]._id },
      { name: 'Multiple Entry Visa', code: 'MULTIPLE_ENTRY', description: 'Valid for multiple entries', status: statuses[0]._id },
      { name: 'Short-term Visa', code: 'SHORT_TERM', description: 'For short stays', status: statuses[0]._id },
      { name: 'Long-term Visa', code: 'LONG_TERM_STAY', description: 'For extended stays', status: statuses[0]._id },

      // Regional Specific
      { name: 'Schengen Visa', code: 'SCHENGEN', description: 'For Schengen Area travel', status: statuses[0]._id },
      { name: 'Gulf Cooperation Council Visa', code: 'GCC', description: 'For GCC countries', status: statuses[0]._id },
      { name: 'ASEAN Visa', code: 'ASEAN', description: 'For ASEAN region', status: statuses[0]._id },

      // Other Categories
      { name: 'Pilgrimage Visa', code: 'PILGRIMAGE', description: 'For religious pilgrimage', status: statuses[0]._id },
      { name: 'Hajj Visa', code: 'HAJJ', description: 'For Hajj pilgrimage', status: statuses[0]._id },
      { name: 'Umrah Visa', code: 'UMRAH', description: 'For Umrah pilgrimage', status: statuses[0]._id },
      { name: 'Property Owner Visa', code: 'PROPERTY_OWNER', description: 'For property owners', status: statuses[0]._id },
      { name: 'Golden Visa', code: 'GOLDEN_VISA', description: 'For investment-based residence', status: statuses[0]._id },
      { name: 'Nomad Visa', code: 'NOMAD', description: 'For location-independent workers', status: statuses[0]._id },
      { name: 'Working Holiday Visa', code: 'WORKING_HOLIDAY', description: 'For working holidays', status: statuses[0]._id },
      { name: 'Youth Mobility Visa', code: 'YOUTH_MOBILITY', description: 'For young travelers', status: statuses[0]._id },
      { name: 'Adoption Visa', code: 'ADOPTION', description: 'For international adoption', status: statuses[0]._id }
    ]);

    // 7. Create Country Visa Types
    const countryVisaTypes = await CountryVisaType.insertMany([
      { name: 'USA Tourist Visa (B-2)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 weeks', processingTimeMax: '5 weeks', totalAmount: '185', agentDiscount: '10', status: statuses[0]._id },
      { name: 'USA Business Visa (B-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 weeks', processingTimeMax: '5 weeks', totalAmount: '185', agentDiscount: '10', status: statuses[0]._id },
      { name: 'USA Student Visa (F-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '3 months', totalAmount: '510', agentDiscount: '15', status: statuses[0]._id },
      { name: 'USA Exchange Visitor Visa (J-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'EXCHANGE')._id, processingTimeMin: '2 months', processingTimeMax: '3 months', totalAmount: '510', agentDiscount: '15', status: statuses[0]._id },
      { name: 'USA Work Visa (H-1B)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '460', agentDiscount: '12', status: statuses[0]._id },
      { name: 'USA Temporary Worker Visa (H-2B)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'TEMP_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '460', agentDiscount: '12', status: statuses[0]._id },
      { name: 'USA Intra-Company Transfer (L-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'ICT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '460', agentDiscount: '12', status: statuses[0]._id },
      { name: 'USA Investor Visa (E-2)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'INVESTOR')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '550', agentDiscount: '20', status: statuses[0]._id },
      { name: 'USA Fiancé Visa (K-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'FIANCE')._id, processingTimeMin: '3 months', processingTimeMax: '6 months', totalAmount: '800', agentDiscount: '25', status: statuses[0]._id },
      { name: 'USA Transit Visa (C-1)', country: countries.find(c => c.code === 'US')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '185', agentDiscount: '10', status: statuses[0]._id },

      // === CANADA ===
      { name: 'Canada Tourist Visa (TRV)', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '8', status: statuses[0]._id },
      { name: 'Canada Business Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '8', status: statuses[0]._id },
      { name: 'Canada Student Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '4 weeks', processingTimeMax: '8 weeks', totalAmount: '150', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Canada Work Permit', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '4 weeks', processingTimeMax: '12 weeks', totalAmount: '155', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Canada Working Holiday Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'WORKING_HOLIDAY')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '250', agentDiscount: '15', status: statuses[0]._id },
      { name: 'Canada Spouse/Partner Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'SPOUSE')._id, processingTimeMin: '12 months', processingTimeMax: '24 months', totalAmount: '1050', agentDiscount: '30', status: statuses[0]._id },
      { name: 'Canada Parent/Grandparent Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'PARENT')._id, processingTimeMin: '20 months', processingTimeMax: '36 months', totalAmount: '1050', agentDiscount: '30', status: statuses[0]._id },
      { name: 'Canada Transit Visa', country: countries.find(c => c.code === 'CA')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '8', status: statuses[0]._id },

      // === UNITED KINGDOM ===
      { name: 'UK Standard Visitor Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '115', agentDiscount: '9', status: statuses[0]._id },
      { name: 'UK Business Visitor Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '115', agentDiscount: '9', status: statuses[0]._id },
      { name: 'UK Student Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '490', agentDiscount: '20', status: statuses[0]._id },
      { name: 'UK Skilled Worker Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '719', agentDiscount: '25', status: statuses[0]._id },
      { name: 'UK Health and Care Worker Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '284', agentDiscount: '15', status: statuses[0]._id },
      { name: 'UK Graduate Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '8 weeks', processingTimeMax: '8 weeks', totalAmount: '822', agentDiscount: '25', status: statuses[0]._id },
      { name: 'UK Spouse/Partner Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'SPOUSE')._id, processingTimeMin: '12 weeks', processingTimeMax: '24 weeks', totalAmount: '1846', agentDiscount: '40', status: statuses[0]._id },
      { name: 'UK Innovator Founder Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'ENTREPRENEUR')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '1191', agentDiscount: '35', status: statuses[0]._id },
      { name: 'UK Transit Visa', country: countries.find(c => c.code === 'GB')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '39', agentDiscount: '5', status: statuses[0]._id },

      // === AUSTRALIA ===
      { name: 'Australia Visitor Visa (600)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '15 days', processingTimeMax: '29 days', totalAmount: '145', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Australia eVisitor (651)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },
      { name: 'Australia Student Visa (500)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '4 months', totalAmount: '650', agentDiscount: '25', status: statuses[0]._id },
      { name: 'Australia Temporary Skill Shortage (482)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '5 months', totalAmount: '1455', agentDiscount: '35', status: statuses[0]._id },
      { name: 'Australia Working Holiday Visa (417)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'WORKING_HOLIDAY')._id, processingTimeMin: '14 days', processingTimeMax: '90 days', totalAmount: '510', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Australia Partner Visa (820/801)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'SPOUSE')._id, processingTimeMin: '12 months', processingTimeMax: '24 months', totalAmount: '8085', agentDiscount: '50', status: statuses[0]._id },
      { name: 'Australia Business Innovation Visa (188)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'INVESTOR')._id, processingTimeMin: '6 months', processingTimeMax: '12 months', totalAmount: '5375', agentDiscount: '45', status: statuses[0]._id },
      { name: 'Australia Transit Visa (771)', country: countries.find(c => c.code === 'AU')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },

      // === SCHENGEN (GERMANY) ===
      { name: 'Germany Schengen Tourist Visa', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Germany Business Visa', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Germany Student Visa', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '6 weeks', processingTimeMax: '12 weeks', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Germany Job Seeker Visa', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '6 weeks', processingTimeMax: '12 weeks', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Germany EU Blue Card', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Germany Family Reunion Visa', country: countries.find(c => c.code === 'DE')._id, visaType: visaTypes.find(v => v.code === 'FAMILY')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },

      // === FRANCE ===
      { name: 'France Schengen Tourist Visa', country: countries.find(c => c.code === 'FR')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'France Student Visa (Long Stay)', country: countries.find(c => c.code === 'FR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '99', agentDiscount: '8', status: statuses[0]._id },
      { name: 'France Work Visa', country: countries.find(c => c.code === 'FR')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '4 weeks', processingTimeMax: '12 weeks', totalAmount: '99', agentDiscount: '8', status: statuses[0]._id },
      { name: 'France Talent Passport', country: countries.find(c => c.code === 'FR')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '99', agentDiscount: '8', status: statuses[0]._id },
      { name: 'France Family Visa', country: countries.find(c => c.code === 'FR')._id, visaType: visaTypes.find(v => v.code === 'FAMILY')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '99', agentDiscount: '8', status: statuses[0]._id },

      // === JAPAN ===
      { name: 'Japan Tourist Visa (Single Entry)', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '7 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Japan Multiple Entry Visa', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'MULTIPLE_ENTRY')._id, processingTimeMin: '5 days', processingTimeMax: '7 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Japan Business Visa', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '7 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Japan Student Visa', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '4 weeks', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Japan Work Visa (Engineer/Specialist)', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Japan Spouse Visa', country: countries.find(c => c.code === 'JP')._id, visaType: visaTypes.find(v => v.code === 'SPOUSE')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },

      // === SINGAPORE ===
      { name: 'Singapore Tourist Visa', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Singapore Business Visa', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Singapore Student Pass', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '90', agentDiscount: '8', status: statuses[0]._id },
      { name: 'Singapore Employment Pass', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '105', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Singapore EntrePass', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'ENTREPRENEUR')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '105', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Singapore Dependent Pass', country: countries.find(c => c.code === 'SG')._id, visaType: visaTypes.find(v => v.code === 'DEPENDENT')._id, processingTimeMin: '4 weeks', processingTimeMax: '8 weeks', totalAmount: '105', agentDiscount: '10', status: statuses[0]._id },

      // === DUBAI (UAE) ===
      { name: 'UAE Tourist Visa (30 Days)', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },
      { name: 'UAE Tourist Visa (90 Days)', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '350', agentDiscount: '15', status: statuses[0]._id },
      { name: 'UAE Business Visa', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '200', agentDiscount: '12', status: statuses[0]._id },
      { name: 'UAE Employment Visa', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '300', agentDiscount: '15', status: statuses[0]._id },
      { name: 'UAE Golden Visa', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'GOLDEN_VISA')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '2000', agentDiscount: '50', status: statuses[0]._id },
      { name: 'UAE Transit Visa', country: countries.find(c => c.code === 'AE')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '2 days', processingTimeMax: '3 days', totalAmount: '60', agentDiscount: '5', status: statuses[0]._id },

      // === CHINA ===
      { name: 'China Tourist Visa (L)', country: countries.find(c => c.code === 'CN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '4 days', processingTimeMax: '7 days', totalAmount: '140', agentDiscount: '10', status: statuses[0]._id },
      { name: 'China Business Visa (M)', country: countries.find(c => c.code === 'CN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '4 days', processingTimeMax: '7 days', totalAmount: '140', agentDiscount: '10', status: statuses[0]._id },
      { name: 'China Student Visa (X1/X2)', country: countries.find(c => c.code === 'CN')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '140', agentDiscount: '10', status: statuses[0]._id },
      { name: 'China Work Visa (Z)', country: countries.find(c => c.code === 'CN')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '140', agentDiscount: '10', status: statuses[0]._id },
      { name: 'China Transit Visa (G)', country: countries.find(c => c.code === 'CN')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '4 days', processingTimeMax: '7 days', totalAmount: '140', agentDiscount: '10', status: statuses[0]._id },

      // === INDIA ===
      { name: 'India e-Tourist Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '25', agentDiscount: '5', status: statuses[0]._id },
      { name: 'India Tourist Visa (Regular)', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'India Business Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'India Student Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'India Employment Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'India Medical Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'MEDICAL')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'India Medical Attendant Visa', country: countries.find(c => c.code === 'IN')._id, visaType: visaTypes.find(v => v.code === 'MEDICAL_ATTENDANT')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === SOUTH KOREA ===
      { name: 'South Korea Tourist Visa', country: countries.find(c => c.code === 'KR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'South Korea Business Visa', country: countries.find(c => c.code === 'KR')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'South Korea Student Visa (D-2)', country: countries.find(c => c.code === 'KR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '50', agentDiscount: '7', status: statuses[0]._id },
      { name: 'South Korea Work Visa (E-7)', country: countries.find(c => c.code === 'KR')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '3 weeks', processingTimeMax: '6 weeks', totalAmount: '50', agentDiscount: '7', status: statuses[0]._id },
      { name: 'South Korea Working Holiday Visa (H-1)', country: countries.find(c => c.code === 'KR')._id, visaType: visaTypes.find(v => v.code === 'WORKING_HOLIDAY')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '50', agentDiscount: '7', status: statuses[0]._id },

      // === THAILAND ===
      { name: 'Thailand Tourist Visa', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Thailand Visa on Arrival', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Thailand Business Visa', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Thailand Education Visa (ED)', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Thailand Work Permit', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Thailand Retirement Visa (O-A)', country: countries.find(c => c.code === 'TH')._id, visaType: visaTypes.find(v => v.code === 'RETIREMENT')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === MALAYSIA ===
      { name: 'Malaysia Tourist Visa', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '35', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Malaysia eVisa', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '2 days', processingTimeMax: '5 days', totalAmount: '50', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Malaysia Business Visa', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Malaysia Student Pass', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Malaysia Employment Pass', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Malaysia MM2H Visa', country: countries.find(c => c.code === 'MY')._id, visaType: visaTypes.find(v => v.code === 'RETIREMENT')._id, processingTimeMin: '3 months', processingTimeMax: '6 months', totalAmount: '500', agentDiscount: '25', status: statuses[0]._id },

      // === VIETNAM ===
      { name: 'Vietnam e-Visa', country: countries.find(c => c.code === 'VN')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '25', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Vietnam Tourist Visa', country: countries.find(c => c.code === 'VN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Vietnam Business Visa', country: countries.find(c => c.code === 'VN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Vietnam Work Permit', country: countries.find(c => c.code === 'VN')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Vietnam Student Visa', country: countries.find(c => c.code === 'VN')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === NEW ZEALAND ===
      { name: 'New Zealand Visitor Visa', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '20 days', processingTimeMax: '30 days', totalAmount: '165', agentDiscount: '10', status: statuses[0]._id },
      { name: 'New Zealand NZeTA', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'ETA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '17', agentDiscount: '3', status: statuses[0]._id },
      { name: 'New Zealand Student Visa', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '4 weeks', processingTimeMax: '8 weeks', totalAmount: '295', agentDiscount: '15', status: statuses[0]._id },
      { name: 'New Zealand Work Visa', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '495', agentDiscount: '20', status: statuses[0]._id },
      { name: 'New Zealand Working Holiday Visa', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'WORKING_HOLIDAY')._id, processingTimeMin: '4 weeks', processingTimeMax: '8 weeks', totalAmount: '280', agentDiscount: '15', status: statuses[0]._id },
      { name: 'New Zealand Partner Visa', country: countries.find(c => c.code === 'NZ')._id, visaType: visaTypes.find(v => v.code === 'PARTNER')._id, processingTimeMin: '6 months', processingTimeMax: '12 months', totalAmount: '1570', agentDiscount: '35', status: statuses[0]._id },

      // === ITALY ===
      { name: 'Italy Schengen Tourist Visa', country: countries.find(c => c.code === 'IT')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Italy Student Visa', country: countries.find(c => c.code === 'IT')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '30 days', processingTimeMax: '90 days', totalAmount: '116', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Italy Work Visa', country: countries.find(c => c.code === 'IT')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '30 days', processingTimeMax: '90 days', totalAmount: '116', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Italy Family Visa', country: countries.find(c => c.code === 'IT')._id, visaType: visaTypes.find(v => v.code === 'FAMILY')._id, processingTimeMin: '30 days', processingTimeMax: '90 days', totalAmount: '116', agentDiscount: '10', status: statuses[0]._id },

      // === SPAIN ===
      { name: 'Spain Schengen Tourist Visa', country: countries.find(c => c.code === 'ES')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Spain Student Visa', country: countries.find(c => c.code === 'ES')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '180', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Spain Work Visa', country: countries.find(c => c.code === 'ES')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '180', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Spain Golden Visa', country: countries.find(c => c.code === 'ES')._id, visaType: visaTypes.find(v => v.code === 'GOLDEN_VISA')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '500', agentDiscount: '25', status: statuses[0]._id },
      { name: 'Spain Digital Nomad Visa', country: countries.find(c => c.code === 'ES')._id, visaType: visaTypes.find(v => v.code === 'DIGITAL_NOMAD')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '180', agentDiscount: '12', status: statuses[0]._id },

      // === NETHERLANDS ===
      { name: 'Netherlands Schengen Tourist Visa', country: countries.find(c => c.code === 'NL')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Netherlands MVV Student Visa', country: countries.find(c => c.code === 'NL')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '90 days', processingTimeMax: '180 days', totalAmount: '350', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Netherlands Highly Skilled Migrant Visa', country: countries.find(c => c.code === 'NL')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '2 weeks', processingTimeMax: '90 days', totalAmount: '350', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Netherlands Partner Visa', country: countries.find(c => c.code === 'NL')._id, visaType: visaTypes.find(v => v.code === 'PARTNER')._id, processingTimeMin: '90 days', processingTimeMax: '180 days', totalAmount: '350', agentDiscount: '20', status: statuses[0]._id },

      // === SWITZERLAND ===
      { name: 'Switzerland Schengen Tourist Visa', country: countries.find(c => c.code === 'CH')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Switzerland Student Visa', country: countries.find(c => c.code === 'CH')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Switzerland Work Permit (L)', country: countries.find(c => c.code === 'CH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === AUSTRIA ===
      { name: 'Austria Schengen Tourist Visa', country: countries.find(c => c.code === 'AT')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Austria Student Visa', country: countries.find(c => c.code === 'AT')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '6 weeks', processingTimeMax: '12 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Austria Red-White-Red Card', country: countries.find(c => c.code === 'AT')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '6 weeks', processingTimeMax: '12 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === PORTUGAL ===
      { name: 'Portugal Schengen Tourist Visa', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Portugal Golden Visa', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'GOLDEN_VISA')._id, processingTimeMin: '3 months', processingTimeMax: '12 months', totalAmount: '5000', agentDiscount: '100', status: statuses[0]._id },
      { name: 'Portugal D7 Visa (Passive Income)', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'RETIREMENT')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Portugal Digital Nomad Visa', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'DIGITAL_NOMAD')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Portugal Student Visa', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Portugal Work Visa', country: countries.find(c => c.code === 'PT')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },

      // === GREECE ===
      { name: 'Greece Schengen Tourist Visa', country: countries.find(c => c.code === 'GR')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Greece Golden Visa', country: countries.find(c => c.code === 'GR')._id, visaType: visaTypes.find(v => v.code === 'GOLDEN_VISA')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '2000', agentDiscount: '50', status: statuses[0]._id },
      { name: 'Greece Student Visa', country: countries.find(c => c.code === 'GR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Greece Work Visa', country: countries.find(c => c.code === 'GR')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },

      // === IRELAND ===
      { name: 'Ireland Short Stay Visa', country: countries.find(c => c.code === 'IE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '8 weeks', processingTimeMax: '8 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Ireland Student Visa', country: countries.find(c => c.code === 'IE')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Ireland Work Permit', country: countries.find(c => c.code === 'IE')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Ireland Critical Skills Visa', country: countries.find(c => c.code === 'IE')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '8 weeks', processingTimeMax: '12 weeks', totalAmount: '1000', agentDiscount: '30', status: statuses[0]._id },

      // === SWEDEN ===
      { name: 'Sweden Schengen Tourist Visa', country: countries.find(c => c.code === 'SE')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Sweden Student Visa', country: countries.find(c => c.code === 'SE')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Sweden Work Permit', country: countries.find(c => c.code === 'SE')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === NORWAY ===
      { name: 'Norway Schengen Tourist Visa', country: countries.find(c => c.code === 'NO')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Norway Student Visa', country: countries.find(c => c.code === 'NO')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '700', agentDiscount: '25', status: statuses[0]._id },
      { name: 'Norway Skilled Worker Visa', country: countries.find(c => c.code === 'NO')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '700', agentDiscount: '25', status: statuses[0]._id },

      // === DENMARK ===
      { name: 'Denmark Schengen Tourist Visa', country: countries.find(c => c.code === 'DK')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Denmark Student Visa', country: countries.find(c => c.code === 'DK')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '400', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Denmark Work Visa', country: countries.find(c => c.code === 'DK')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '400', agentDiscount: '20', status: statuses[0]._id },

      // === FINLAND ===
      { name: 'Finland Schengen Tourist Visa', country: countries.find(c => c.code === 'FI')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Finland Student Visa', country: countries.find(c => c.code === 'FI')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '520', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Finland Work Visa', country: countries.find(c => c.code === 'FI')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '6 months', totalAmount: '520', agentDiscount: '20', status: statuses[0]._id },

      // === POLAND ===
      { name: 'Poland Schengen Tourist Visa', country: countries.find(c => c.code === 'PL')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Poland Student Visa', country: countries.find(c => c.code === 'PL')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Poland Work Visa', country: countries.find(c => c.code === 'PL')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === CZECH REPUBLIC ===
      { name: 'Czech Republic Schengen Tourist Visa', country: countries.find(c => c.code === 'CZ')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Czech Republic Student Visa', country: countries.find(c => c.code === 'CZ')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '110', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Czech Republic Work Visa', country: countries.find(c => c.code === 'CZ')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '110', agentDiscount: '10', status: statuses[0]._id },

      // === RUSSIA ===
      { name: 'Russia Tourist Visa', country: countries.find(c => c.code === 'RU')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '20 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Russia Business Visa', country: countries.find(c => c.code === 'RU')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '20 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Russia Student Visa', country: countries.find(c => c.code === 'RU')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Russia Work Visa', country: countries.find(c => c.code === 'RU')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Russia Transit Visa', country: countries.find(c => c.code === 'RU')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '5 days', processingTimeMax: '20 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === TURKEY ===
      { name: 'Turkey e-Visa', country: countries.find(c => c.code === 'TR')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Turkey Tourist Visa', country: countries.find(c => c.code === 'TR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Turkey Student Visa', country: countries.find(c => c.code === 'TR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', totalAmount: '110', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Turkey Work Permit', country: countries.find(c => c.code === 'TR')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === BRAZIL ===
      { name: 'Brazil Tourist Visa', country: countries.find(c => c.code === 'BR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Brazil Business Visa', country: countries.find(c => c.code === 'BR')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Brazil Student Visa', country: countries.find(c => c.code === 'BR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Brazil Work Visa', country: countries.find(c => c.code === 'BR')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === ARGENTINA ===
      { name: 'Argentina Tourist Visa', country: countries.find(c => c.code === 'AR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Argentina Business Visa', country: countries.find(c => c.code === 'AR')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Argentina Student Visa', country: countries.find(c => c.code === 'AR')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Argentina Work Visa', country: countries.find(c => c.code === 'AR')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '300', agentDiscount: '15', status: statuses[0]._id },

      // === MEXICO ===
      { name: 'Mexico Tourist Visa', country: countries.find(c => c.code === 'MX')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '36', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Mexico Business Visa', country: countries.find(c => c.code === 'MX')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '36', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Mexico Student Visa', country: countries.find(c => c.code === 'MX')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '36', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Mexico Temporary Resident Visa', country: countries.find(c => c.code === 'MX')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '45', agentDiscount: '7', status: statuses[0]._id },

      // === SOUTH AFRICA ===
      { name: 'South Africa Tourist Visa', country: countries.find(c => c.code === 'ZA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'South Africa Business Visa', country: countries.find(c => c.code === 'ZA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '10 days', processingTimeMax: '30 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'South Africa Student Visa', country: countries.find(c => c.code === 'ZA')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '6 weeks', processingTimeMax: '8 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'South Africa Critical Skills Work Visa', country: countries.find(c => c.code === 'ZA')._id, visaType: visaTypes.find(v => v.code === 'SKILLED_WORKER')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === EGYPT ===
      { name: 'Egypt e-Visa', country: countries.find(c => c.code === 'EG')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '25', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Egypt Tourist Visa', country: countries.find(c => c.code === 'EG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Egypt Business Visa', country: countries.find(c => c.code === 'EG')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Egypt Student Visa', country: countries.find(c => c.code === 'EG')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Egypt Work Visa', country: countries.find(c => c.code === 'EG')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === KENYA ===
      { name: 'Kenya e-Visa', country: countries.find(c => c.code === 'KE')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '2 days', processingTimeMax: '7 days', totalAmount: '51', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Kenya Tourist Visa', country: countries.find(c => c.code === 'KE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '51', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Kenya Business Visa', country: countries.find(c => c.code === 'KE')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '51', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Kenya Transit Visa', country: countries.find(c => c.code === 'KE')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '2 days', processingTimeMax: '5 days', totalAmount: '21', agentDiscount: '3', status: statuses[0]._id },

      // === MOROCCO ===
      { name: 'Morocco Tourist Visa', country: countries.find(c => c.code === 'MA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '10 days', processingTimeMax: '20 days', totalAmount: '27', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Morocco Business Visa', country: countries.find(c => c.code === 'MA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '10 days', processingTimeMax: '20 days', totalAmount: '27', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Morocco Student Visa', country: countries.find(c => c.code === 'MA')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '27', agentDiscount: '5', status: statuses[0]._id },

      // === ISRAEL ===
      { name: 'Israel Tourist Visa (B-2)', country: countries.find(c => c.code === 'IL')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '25', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Israel Business Visa (B-1)', country: countries.find(c => c.code === 'IL')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '25', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Israel Student Visa (A-2)', country: countries.find(c => c.code === 'IL')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '3 weeks', processingTimeMax: '8 weeks', totalAmount: '45', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Israel Work Visa (B-1)', country: countries.find(c => c.code === 'IL')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '185', agentDiscount: '12', status: statuses[0]._id },

      // === SAUDI ARABIA ===
      { name: 'Saudi Arabia Tourist Visa', country: countries.find(c => c.code === 'SA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '135', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Saudi Arabia Business Visa', country: countries.find(c => c.code === 'SA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },
      { name: 'Saudi Arabia Work Visa', country: countries.find(c => c.code === 'SA')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '650', agentDiscount: '25', status: statuses[0]._id },
      { name: 'Saudi Arabia Hajj Visa', country: countries.find(c => c.code === 'SA')._id, visaType: visaTypes.find(v => v.code === 'HAJJ')._id, processingTimeMin: '1 month', processingTimeMax: '2 months', totalAmount: '300', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Saudi Arabia Umrah Visa', country: countries.find(c => c.code === 'SA')._id, visaType: visaTypes.find(v => v.code === 'UMRAH')._id, processingTimeMin: '3 days', processingTimeMax: '10 days', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },

      // === QATAR ===
      { name: 'Qatar Tourist Visa', country: countries.find(c => c.code === 'QA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Qatar Business Visa', country: countries.find(c => c.code === 'QA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Qatar Work Visa', country: countries.find(c => c.code === 'QA')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },
      { name: 'Qatar Transit Visa', country: countries.find(c => c.code === 'QA')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '10', agentDiscount: '2', status: statuses[0]._id },

      // === KUWAIT ===
      { name: 'Kuwait Tourist Visa', country: countries.find(c => c.code === 'KW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Kuwait Business Visa', country: countries.find(c => c.code === 'KW')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Kuwait Work Visa', country: countries.find(c => c.code === 'KW')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === BAHRAIN ===
      { name: 'Bahrain Tourist Visa', country: countries.find(c => c.code === 'BH')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Bahrain eVisa', country: countries.find(c => c.code === 'BH')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '2 days', totalAmount: '29', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Bahrain Business Visa', country: countries.find(c => c.code === 'BH')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Bahrain Work Visa', country: countries.find(c => c.code === 'BH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === OMAN ===
      { name: 'Oman Tourist Visa', country: countries.find(c => c.code === 'OM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Oman eVisa', country: countries.find(c => c.code === 'OM')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },
      { name: 'Oman Business Visa', country: countries.find(c => c.code === 'OM')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Oman Work Visa', country: countries.find(c => c.code === 'OM')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === JORDAN ===
      { name: 'Jordan Visa on Arrival', country: countries.find(c => c.code === 'JO')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Jordan Tourist Visa', country: countries.find(c => c.code === 'JO')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Jordan Business Visa', country: countries.find(c => c.code === 'JO')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Jordan Student Visa', country: countries.find(c => c.code === 'JO')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === LEBANON ===
      { name: 'Lebanon Tourist Visa', country: countries.find(c => c.code === 'LB')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Lebanon Business Visa', country: countries.find(c => c.code === 'LB')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Lebanon Student Visa', country: countries.find(c => c.code === 'LB')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === SRI LANKA ===
      { name: 'Sri Lanka ETA (Electronic Travel Authorization)', country: countries.find(c => c.code === 'LK')._id, visaType: visaTypes.find(v => v.code === 'ETA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Sri Lanka Tourist Visa', country: countries.find(c => c.code === 'LK')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Sri Lanka Business Visa', country: countries.find(c => c.code === 'LK')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Sri Lanka Student Visa', country: countries.find(c => c.code === 'LK')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === BANGLADESH ===
      { name: 'Bangladesh Tourist Visa', country: countries.find(c => c.code === 'BD')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Bangladesh Business Visa', country: countries.find(c => c.code === 'BD')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '160', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Bangladesh Work Visa', country: countries.find(c => c.code === 'BD')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '300', agentDiscount: '20', status: statuses[0]._id },

      // === PAKISTAN ===
      { name: 'Pakistan Tourist Visa', country: countries.find(c => c.code === 'PK')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Pakistan Business Visa', country: countries.find(c => c.code === 'PK')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Pakistan Student Visa', country: countries.find(c => c.code === 'PK')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Pakistan Work Visa', country: countries.find(c => c.code === 'PK')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === NEPAL ===
      { name: 'Nepal Tourist Visa on Arrival', country: countries.find(c => c.code === 'NP')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Nepal Tourist Visa', country: countries.find(c => c.code === 'NP')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Nepal Business Visa', country: countries.find(c => c.code === 'NP')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Nepal Student Visa', country: countries.find(c => c.code === 'NP')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === MALDIVES ===
      { name: 'Maldives Tourist Visa on Arrival', country: countries.find(c => c.code === 'MV')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },
      { name: 'Maldives Work Visa', country: countries.find(c => c.code === 'MV')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === BHUTAN ===
      { name: 'Bhutan Tourist Visa', country: countries.find(c => c.code === 'BT')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },

      // === CAMBODIA ===
      { name: 'Cambodia e-Visa', country: countries.find(c => c.code === 'KH')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '36', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Cambodia Tourist Visa', country: countries.find(c => c.code === 'KH')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '36', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Cambodia Business Visa', country: countries.find(c => c.code === 'KH')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Cambodia Work Visa', country: countries.find(c => c.code === 'KH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '300', agentDiscount: '20', status: statuses[0]._id },

      // === LAOS ===
      { name: 'Laos e-Visa', country: countries.find(c => c.code === 'LA')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Laos Tourist Visa', country: countries.find(c => c.code === 'LA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Laos Business Visa', country: countries.find(c => c.code === 'LA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === MYANMAR ===
      { name: 'Myanmar e-Visa', country: countries.find(c => c.code === 'MM')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Myanmar Tourist Visa', country: countries.find(c => c.code === 'MM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Myanmar Business Visa', country: countries.find(c => c.code === 'MM')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === PHILIPPINES ===
      { name: 'Philippines Tourist Visa', country: countries.find(c => c.code === 'PH')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Philippines Business Visa', country: countries.find(c => c.code === 'PH')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '30', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Philippines Student Visa', country: countries.find(c => c.code === 'PH')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '50', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Philippines Work Visa', country: countries.find(c => c.code === 'PH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === INDONESIA ===
      { name: 'Indonesia e-Visa on Arrival', country: countries.find(c => c.code === 'ID')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '35', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Indonesia Tourist Visa', country: countries.find(c => c.code === 'ID')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Indonesia Business Visa', country: countries.find(c => c.code === 'ID')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Indonesia Social/Cultural Visa', country: countries.find(c => c.code === 'ID')._id, visaType: visaTypes.find(v => v.code === 'VISITOR')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Indonesia Work Visa (KITAS)', country: countries.find(c => c.code === 'ID')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === BRUNEI ===
      { name: 'Brunei Tourist Visa', country: countries.find(c => c.code === 'BN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },
      { name: 'Brunei Business Visa', country: countries.find(c => c.code === 'BN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },

      // === TAIWAN ===
      { name: 'Taiwan Tourist Visa', country: countries.find(c => c.code === 'TW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Taiwan Business Visa', country: countries.find(c => c.code === 'TW')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Taiwan Student Visa', country: countries.find(c => c.code === 'TW')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Taiwan Work Visa', country: countries.find(c => c.code === 'TW')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === MONGOLIA ===
      { name: 'Mongolia Tourist Visa', country: countries.find(c => c.code === 'MN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Mongolia Business Visa', country: countries.find(c => c.code === 'MN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === KAZAKHSTAN ===
      { name: 'Kazakhstan Tourist Visa', country: countries.find(c => c.code === 'KZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Kazakhstan Business Visa', country: countries.find(c => c.code === 'KZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Kazakhstan Work Visa', country: countries.find(c => c.code === 'KZ')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === UZBEKISTAN ===
      { name: 'Uzbekistan e-Visa', country: countries.find(c => c.code === 'UZ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '2 days', processingTimeMax: '3 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },
      { name: 'Uzbekistan Tourist Visa', country: countries.find(c => c.code === 'UZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Uzbekistan Business Visa', country: countries.find(c => c.code === 'UZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === KYRGYZSTAN ===
      { name: 'Kyrgyzstan e-Visa', country: countries.find(c => c.code === 'KG')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '51', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Kyrgyzstan Tourist Visa', country: countries.find(c => c.code === 'KG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },

      // === TAJIKISTAN ===
      { name: 'Tajikistan e-Visa', country: countries.find(c => c.code === 'TJ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '2 days', processingTimeMax: '5 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Tajikistan Tourist Visa', country: countries.find(c => c.code === 'TJ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === AZERBAIJAN ===
      { name: 'Azerbaijan e-Visa', country: countries.find(c => c.code === 'AZ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },
      { name: 'Azerbaijan Tourist Visa', country: countries.find(c => c.code === 'AZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Azerbaijan Business Visa', country: countries.find(c => c.code === 'AZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === ARMENIA ===
      { name: 'Armenia e-Visa', country: countries.find(c => c.code === 'AM')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '6', agentDiscount: '2', status: statuses[0]._id },
      { name: 'Armenia Tourist Visa', country: countries.find(c => c.code === 'AM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Armenia Business Visa', country: countries.find(c => c.code === 'AM')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === GEORGIA ===
      { name: 'Georgia e-Visa', country: countries.find(c => c.code === 'GE')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },
      { name: 'Georgia Tourist Visa', country: countries.find(c => c.code === 'GE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Georgia Business Visa', country: countries.find(c => c.code === 'GE')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === IRAN ===
      { name: 'Iran Tourist Visa', country: countries.find(c => c.code === 'IR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Iran Business Visa', country: countries.find(c => c.code === 'IR')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },

      // === IRAQ ===
      { name: 'Iraq Tourist Visa', country: countries.find(c => c.code === 'IQ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Iraq Business Visa', country: countries.find(c => c.code === 'IQ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === CYPRUS ===
      { name: 'Cyprus Schengen Visa', country: countries.find(c => c.code === 'CY')._id, visaType: visaTypes.find(v => v.code === 'SCHENGEN')._id, processingTimeMin: '15 days', processingTimeMax: '30 days', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Cyprus Student Visa', country: countries.find(c => c.code === 'CY')._id, visaType: visaTypes.find(v => v.code === 'STUDENT')._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Cyprus Work Visa', country: countries.find(c => c.code === 'CY')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 months', processingTimeMax: '4 months', totalAmount: '90', agentDiscount: '7', status: statuses[0]._id },

      // === FIJI ===
      { name: 'Fiji Tourist Visa', country: countries.find(c => c.code === 'FJ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Fiji Business Visa', country: countries.find(c => c.code === 'FJ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === PAPUA NEW GUINEA ===
      { name: 'Papua New Guinea Tourist Visa', country: countries.find(c => c.code === 'PG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '10 days', processingTimeMax: '20 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Papua New Guinea Business Visa', country: countries.find(c => c.code === 'PG')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '10 days', processingTimeMax: '20 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === SAMOA ===
      { name: 'Samoa Visitor Permit', country: countries.find(c => c.code === 'WS')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },

      // === TONGA ===
      { name: 'Tonga Visitor Visa', country: countries.find(c => c.code === 'TO')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === VANUATU ===
      { name: 'Vanuatu Tourist Visa', country: countries.find(c => c.code === 'VU')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === ETHIOPIA ===
      { name: 'Ethiopia e-Visa', country: countries.find(c => c.code === 'ET')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '52', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Ethiopia Tourist Visa', country: countries.find(c => c.code === 'ET')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '52', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Ethiopia Business Visa', country: countries.find(c => c.code === 'ET')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },

      // === TANZANIA ===
      { name: 'Tanzania e-Visa', country: countries.find(c => c.code === 'TZ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Tanzania Tourist Visa', country: countries.find(c => c.code === 'TZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Tanzania Business Visa', country: countries.find(c => c.code === 'TZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '250', agentDiscount: '20', status: statuses[0]._id },

      // === UGANDA ===
      { name: 'Uganda e-Visa', country: countries.find(c => c.code === 'UG')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Uganda Tourist Visa', country: countries.find(c => c.code === 'UG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Uganda Business Visa', country: countries.find(c => c.code === 'UG')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === RWANDA ===
      { name: 'Rwanda e-Visa', country: countries.find(c => c.code === 'RW')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Rwanda Tourist Visa', country: countries.find(c => c.code === 'RW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Rwanda Business Visa', country: countries.find(c => c.code === 'RW')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },
      // === GHANA ===
      { name: 'Ghana Tourist Visa', country: countries.find(c => c.code === 'GH')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Ghana Business Visa', country: countries.find(c => c.code === 'GH')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Ghana Work Visa', country: countries.find(c => c.code === 'GH')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '200', agentDiscount: '15', status: statuses[0]._id },

      // === NIGERIA ===
      { name: 'Nigeria Tourist Visa', country: countries.find(c => c.code === 'NG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '180', agentDiscount: '15', status: statuses[0]._id },
      { name: 'Nigeria Business Visa', country: countries.find(c => c.code === 'NG')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '15 days', totalAmount: '180', agentDiscount: '15', status: statuses[0]._id },
      { name: 'Nigeria Work Visa', country: countries.find(c => c.code === 'NG')._id, visaType: visaTypes.find(v => v.code === 'WORK')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '300', agentDiscount: '20', status: statuses[0]._id },
      { name: 'Nigeria Transit Visa', country: countries.find(c => c.code === 'NG')._id, visaType: visaTypes.find(v => v.code === 'TRANSIT')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },

      // === SENEGAL ===
      { name: 'Senegal Tourist Visa', country: countries.find(c => c.code === 'SN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Senegal Business Visa', country: countries.find(c => c.code === 'SN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === IVORY COAST ===
      { name: 'Ivory Coast e-Visa', country: countries.find(c => c.code === 'CI')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '73', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Ivory Coast Tourist Visa', country: countries.find(c => c.code === 'CI')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Ivory Coast Business Visa', country: countries.find(c => c.code === 'CI')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === CAMEROON ===
      { name: 'Cameroon Tourist Visa', country: countries.find(c => c.code === 'CM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Cameroon Business Visa', country: countries.find(c => c.code === 'CM')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },

      // === ZIMBABWE ===
      { name: 'Zimbabwe e-Visa', country: countries.find(c => c.code === 'ZW')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Zimbabwe Tourist Visa', country: countries.find(c => c.code === 'ZW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Zimbabwe Business Visa', country: countries.find(c => c.code === 'ZW')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },

      // === ZAMBIA ===
      { name: 'Zambia e-Visa', country: countries.find(c => c.code === 'ZM')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Zambia Tourist Visa', country: countries.find(c => c.code === 'ZM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Zambia Business Visa', country: countries.find(c => c.code === 'ZM')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === MOZAMBIQUE ===
      { name: 'Mozambique Tourist Visa', country: countries.find(c => c.code === 'MZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Mozambique Business Visa', country: countries.find(c => c.code === 'MZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === BOTSWANA ===
      { name: 'Botswana Tourist Visa', country: countries.find(c => c.code === 'BW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Botswana Business Visa', country: countries.find(c => c.code === 'BW')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },

      // === NAMIBIA ===
      { name: 'Namibia Tourist Visa', country: countries.find(c => c.code === 'NA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Namibia Business Visa', country: countries.find(c => c.code === 'NA')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '80', agentDiscount: '7', status: statuses[0]._id },

      // === MAURITIUS ===
      { name: 'Mauritius Tourist Visa', country: countries.find(c => c.code === 'MU')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },
      { name: 'Mauritius Business Visa', country: countries.find(c => c.code === 'MU')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === SEYCHELLES ===
      { name: 'Seychelles Visitor Permit', country: countries.find(c => c.code === 'SC')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '0', agentDiscount: '0', status: statuses[0]._id },

      // === MADAGASCAR ===
      { name: 'Madagascar e-Visa', country: countries.find(c => c.code === 'MG')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '35', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Madagascar Tourist Visa', country: countries.find(c => c.code === 'MG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '37', agentDiscount: '5', status: statuses[0]._id },

      // === TUNISIA ===
      { name: 'Tunisia Tourist Visa', country: countries.find(c => c.code === 'TN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Tunisia Business Visa', country: countries.find(c => c.code === 'TN')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === ALGERIA ===
      { name: 'Algeria Tourist Visa', country: countries.find(c => c.code === 'DZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '85', agentDiscount: '7', status: statuses[0]._id },
      { name: 'Algeria Business Visa', country: countries.find(c => c.code === 'DZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '85', agentDiscount: '7', status: statuses[0]._id },

      // === ANGOLA ===
      { name: 'Angola Tourist Visa', country: countries.find(c => c.code === 'AO')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Angola Business Visa', country: countries.find(c => c.code === 'AO')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },

      // === BENIN ===
      { name: 'Benin e-Visa', country: countries.find(c => c.code === 'BJ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Benin Tourist Visa', country: countries.find(c => c.code === 'BJ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === TOGO ===
      { name: 'Togo e-Visa', country: countries.find(c => c.code === 'TG')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '5 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Togo Tourist Visa', country: countries.find(c => c.code === 'TG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },

      // === GABON ===
      { name: 'Gabon e-Visa', country: countries.find(c => c.code === 'GA')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },
      { name: 'Gabon Tourist Visa', country: countries.find(c => c.code === 'GA')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === DJIBOUTI ===
      { name: 'Djibouti e-Visa', country: countries.find(c => c.code === 'DJ')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '1 day', processingTimeMax: '3 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },
      { name: 'Djibouti Tourist Visa', country: countries.find(c => c.code === 'DJ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },

      // === MALAWI ===
      { name: 'Malawi e-Visa', country: countries.find(c => c.code === 'MW')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Malawi Tourist Visa', country: countries.find(c => c.code === 'MW')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '75', agentDiscount: '7', status: statuses[0]._id },

      // === LESOTHO ===
      { name: 'Lesotho Tourist Visa', country: countries.find(c => c.code === 'LS')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '40', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Lesotho Business Visa', country: countries.find(c => c.code === 'LS')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id },

      // === ESWATINI (SWAZILAND) ===
      { name: 'Eswatini Tourist Visa', country: countries.find(c => c.code === 'SZ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Eswatini Business Visa', country: countries.find(c => c.code === 'SZ')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '50', agentDiscount: '5', status: statuses[0]._id },

      // === COMOROS ===
      { name: 'Comoros Visa on Arrival', country: countries.find(c => c.code === 'KM')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '30', agentDiscount: '3', status: statuses[0]._id },

      // === CABO VERDE ===
      { name: 'Cabo Verde Tourist Visa', country: countries.find(c => c.code === 'CV')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '45', agentDiscount: '5', status: statuses[0]._id },
      { name: 'Cabo Verde Business Visa', country: countries.find(c => c.code === 'CV')._id, visaType: visaTypes.find(v => v.code === 'BUSINESS')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '45', agentDiscount: '5', status: statuses[0]._id },

      // === SAO TOME AND PRINCIPE ===
      { name: 'Sao Tome and Principe e-Visa', country: countries.find(c => c.code === 'ST')._id, visaType: visaTypes.find(v => v.code === 'E_VISA')._id, processingTimeMin: '3 days', processingTimeMax: '7 days', totalAmount: '20', agentDiscount: '3', status: statuses[0]._id },

      // === EQUATORIAL GUINEA ===
      { name: 'Equatorial Guinea Tourist Visa', country: countries.find(c => c.code === 'GQ')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === GAMBIA ===
      { name: 'Gambia Tourist Visa', country: countries.find(c => c.code === 'GM')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '5 days', processingTimeMax: '10 days', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === GUINEA ===
      { name: 'Guinea Tourist Visa', country: countries.find(c => c.code === 'GN')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === GUINEA-BISSAU ===
      { name: 'Guinea-Bissau Visa on Arrival', country: countries.find(c => c.code === 'GW')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '85', agentDiscount: '7', status: statuses[0]._id },

      // === LIBERIA ===
      { name: 'Liberia Tourist Visa', country: countries.find(c => c.code === 'LR')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === SIERRA LEONE ===
      { name: 'Sierra Leone Tourist Visa', country: countries.find(c => c.code === 'SL')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === MALI ===
      { name: 'Mali Tourist Visa', country: countries.find(c => c.code === 'ML')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === BURKINA FASO ===
      { name: 'Burkina Faso Tourist Visa', country: countries.find(c => c.code === 'BF')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === NIGER ===
      { name: 'Niger Tourist Visa', country: countries.find(c => c.code === 'NE')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === CHAD ===
      { name: 'Chad Tourist Visa', country: countries.find(c => c.code === 'TD')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === MAURITANIA ===
      { name: 'Mauritania Visa on Arrival', country: countries.find(c => c.code === 'MR')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '120', agentDiscount: '10', status: statuses[0]._id },

      // === CONGO ===
      { name: 'Congo Tourist Visa', country: countries.find(c => c.code === 'CG')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === DR CONGO ===
      { name: 'DR Congo Tourist Visa', country: countries.find(c => c.code === 'CD')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '3 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === BURUNDI ===
      { name: 'Burundi Tourist Visa', country: countries.find(c => c.code === 'BI')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '90', agentDiscount: '10', status: statuses[0]._id },

      // === CENTRAL AFRICAN REPUBLIC ===
      { name: 'Central African Republic Tourist Visa', country: countries.find(c => c.code === 'CF')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '150', agentDiscount: '12', status: statuses[0]._id },

      // === SOUTH SUDAN ===
      { name: 'South Sudan Tourist Visa', country: countries.find(c => c.code === 'SS')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === SUDAN ===
      { name: 'Sudan Tourist Visa', country: countries.find(c => c.code === 'SD')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '100', agentDiscount: '10', status: statuses[0]._id },

      // === ERITREA ===
      { name: 'Eritrea Tourist Visa', country: countries.find(c => c.code === 'ER')._id, visaType: visaTypes.find(v => v.code === 'TOURIST')._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', totalAmount: '70', agentDiscount: '7', status: statuses[0]._id },

      // === SOMALIA ===
      { name: 'Somalia Visa on Arrival', country: countries.find(c => c.code === 'SO')._id, visaType: visaTypes.find(v => v.code === 'VISA_ON_ARRIVAL')._id, processingTimeMin: '1 day', processingTimeMax: '1 day', totalAmount: '60', agentDiscount: '7', status: statuses[0]._id }

    ]);

    const usaTouristPersonal = await FormSection.create({
      name: 'Personal Information',
      description: 'Basic personal details of the applicant',
      order: 1,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: usaTouristPersonal._id, status: statuses[0]._id },
      { name: 'middleName', label: 'Middle Name', type: 'text', required: false, order: 2, formSection: usaTouristPersonal._id, status: statuses[0]._id },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 3, formSection: usaTouristPersonal._id, status: statuses[0]._id },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 4, formSection: usaTouristPersonal._id, status: statuses[0]._id },
      { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true, order: 5, formSection: usaTouristPersonal._id, status: statuses[0]._id },
      { name: 'nationality', label: 'Nationality', type: 'select', required: true, order: 6, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Indian', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Japanese', 'Chinese', 'Other'] },
      { name: 'gender', label: 'Gender', type: 'radio', required: true, order: 7, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Male', 'Female', 'Other'] },
      { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: true, order: 8, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Single', 'Married', 'Divorced', 'Widowed'] }
    ]);

    const usaTouristPassport = await FormSection.create({
      name: 'Passport Information',
      description: 'Details about your passport',
      order: 2,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 1, formSection: usaTouristPassport._id, status: statuses[0]._id },
      { name: 'passportIssueDate', label: 'Issue Date', type: 'date', required: true, order: 2, formSection: usaTouristPassport._id, status: statuses[0]._id },
      { name: 'passportExpiryDate', label: 'Expiry Date', type: 'date', required: true, order: 3, formSection: usaTouristPassport._id, status: statuses[0]._id },
      { name: 'issuingAuthority', label: 'Issuing Authority', type: 'text', required: true, order: 4, formSection: usaTouristPassport._id, status: statuses[0]._id },
      { name: 'previousPassports', label: 'Do you have previous passports?', type: 'radio', required: true, order: 5, formSection: usaTouristPassport._id, status: statuses[0]._id, options: ['Yes', 'No'] }
    ]);

    const usaTouristContact = await FormSection.create({
      name: 'Contact Information',
      description: 'Your contact details and address',
      order: 3,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'email', label: 'Email Address', type: 'email', required: true, order: 1, formSection: usaTouristContact._id, status: statuses[0]._id },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true, order: 2, formSection: usaTouristContact._id, status: statuses[0]._id },
      { name: 'address', label: 'Home Address', type: 'textarea', required: true, order: 3, formSection: usaTouristContact._id, status: statuses[0]._id },
      { name: 'city', label: 'City', type: 'text', required: true, order: 4, formSection: usaTouristContact._id, status: statuses[0]._id },
      { name: 'state', label: 'State/Province', type: 'text', required: true, order: 5, formSection: usaTouristContact._id, status: statuses[0]._id },
      { name: 'postalCode', label: 'Postal Code', type: 'text', required: true, order: 6, formSection: usaTouristContact._id, status: statuses[0]._id }
    ]);

    const usaTouristTravel = await FormSection.create({
      name: 'Travel Information',
      description: 'Details about your planned travel',
      order: 4,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'select', required: true, order: 1, formSection: usaTouristTravel._id, status: statuses[0]._id, options: ['Tourism', 'Business', 'Medical Treatment', 'Visiting Friends/Family', 'Transit', 'Other'] },
      { name: 'intendedArrivalDate', label: 'Intended Arrival Date', type: 'date', required: true, order: 2, formSection: usaTouristTravel._id, status: statuses[0]._id },
      { name: 'intendedDepartureDate', label: 'Intended Departure Date', type: 'date', required: true, order: 3, formSection: usaTouristTravel._id, status: statuses[0]._id },
      { name: 'accommodationType', label: 'Accommodation Type', type: 'select', required: true, order: 4, formSection: usaTouristTravel._id, status: statuses[0]._id, options: ['Hotel', 'Airbnb', 'Friends/Family', 'Hostel', 'Other'] },
      { name: 'accommodationAddress', label: 'Accommodation Address', type: 'textarea', required: true, order: 5, formSection: usaTouristTravel._id, status: statuses[0]._id }
    ]);

    const usaTouristEmployment = await FormSection.create({
      name: 'Employment Information',
      description: 'Your current employment details',
      order: 5,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'employmentStatus', label: 'Employment Status', type: 'select', required: true, order: 1, formSection: usaTouristEmployment._id, status: statuses[0]._id, options: ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired', 'Other'] },
      { name: 'employerName', label: 'Employer Name', type: 'text', required: false, order: 2, formSection: usaTouristEmployment._id, status: statuses[0]._id },
      { name: 'jobTitle', label: 'Job Title', type: 'text', required: false, order: 3, formSection: usaTouristEmployment._id, status: statuses[0]._id },
      { name: 'monthlyIncome', label: 'Monthly Income (USD)', type: 'number', required: false, order: 4, formSection: usaTouristEmployment._id, status: statuses[0]._id }
    ]);

    const usaTouristFinancial = await FormSection.create({
      name: 'Financial Information',
      description: 'Financial support and funding details',
      order: 6,
      countryVisaType: countryVisaTypes[0]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'bankBalance', label: 'Current Bank Balance (USD)', type: 'number', required: true, order: 1, formSection: usaTouristFinancial._id, status: statuses[0]._id },
      { name: 'fundingSource', label: 'Who is funding your trip?', type: 'select', required: true, order: 2, formSection: usaTouristFinancial._id, status: statuses[0]._id, options: ['Self', 'Family', 'Employer', 'Sponsor', 'Other'] },
      { name: 'estimatedTripCost', label: 'Estimated Trip Cost (USD)', type: 'number', required: true, order: 3, formSection: usaTouristFinancial._id, status: statuses[0]._id }
    ]);

    // UK Student Visa Form Sections
    const ukStudentPersonal = await FormSection.create({
      name: 'Personal Information',
      description: 'Basic personal details of the student applicant',
      order: 1,
      countryVisaType: countryVisaTypes[6]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: ukStudentPersonal._id, status: statuses[0]._id },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 2, formSection: ukStudentPersonal._id, status: statuses[0]._id },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 3, formSection: ukStudentPersonal._id, status: statuses[0]._id },
      { name: 'nationality', label: 'Nationality', type: 'select', required: true, order: 4, formSection: ukStudentPersonal._id, status: statuses[0]._id },
      { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 5, formSection: ukStudentPersonal._id, status: statuses[0]._id }
    ]);

    const ukStudentEducation = await FormSection.create({
      name: 'Education Information',
      description: 'Your educational background and UK study plans',
      order: 2,
      countryVisaType: countryVisaTypes[6]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'ukInstitution', label: 'UK Institution Name', type: 'text', required: true, order: 1, formSection: ukStudentEducation._id, status: statuses[0]._id },
      { name: 'courseTitle', label: 'Course Title', type: 'text', required: true, order: 2, formSection: ukStudentEducation._id, status: statuses[0]._id },
      { name: 'courseLevel', label: 'Course Level', type: 'select', required: true, order: 3, formSection: ukStudentEducation._id, status: statuses[0]._id },
      { name: 'courseStartDate', label: 'Course Start Date', type: 'date', required: true, order: 4, formSection: ukStudentEducation._id, status: statuses[0]._id },
      { name: 'courseDuration', label: 'Course Duration (months)', type: 'number', required: true, order: 5, formSection: ukStudentEducation._id, status: statuses[0]._id },
      { name: 'casNumber', label: 'CAS Number', type: 'text', required: true, order: 6, formSection: ukStudentEducation._id, status: statuses[0]._id }
    ]);

    const ukStudentFinancial = await FormSection.create({
      name: 'Financial Information',
      description: 'Proof of financial support for your studies',
      order: 3,
      countryVisaType: countryVisaTypes[6]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'tuitionFees', label: 'Annual Tuition Fees (GBP)', type: 'number', required: true, order: 1, formSection: ukStudentFinancial._id, status: statuses[0]._id },
      { name: 'livingCosts', label: 'Annual Living Costs (GBP)', type: 'number', required: true, order: 2, formSection: ukStudentFinancial._id, status: statuses[0]._id },
      { name: 'financialSponsor', label: 'Financial Sponsor', type: 'select', required: true, order: 3, formSection: ukStudentFinancial._id, status: statuses[0]._id },
      { name: 'bankBalance', label: 'Available Funds (GBP)', type: 'number', required: true, order: 4, formSection: ukStudentFinancial._id, status: statuses[0]._id }
    ]);

    // Canada Tourist Visa Form Sections
    const canadaTouristPersonal = await FormSection.create({
      name: 'Personal Information',
      description: 'Personal details for Canada visitor visa',
      order: 1,
      countryVisaType: countryVisaTypes[3]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 2, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 3, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
      { name: 'citizenship', label: 'Citizenship', type: 'text', required: true, order: 4, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
      { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: true, order: 5, formSection: canadaTouristPersonal._id, status: statuses[0]._id }
    ]);

    const canadaTouristTravel = await FormSection.create({
      name: 'Travel Details',
      description: 'Information about your planned visit to Canada',
      order: 2,
      countryVisaType: countryVisaTypes[3]._id,
      status: statuses[0]._id
    });

    await FormField.insertMany([
      { name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'select', required: true, order: 1, formSection: canadaTouristTravel._id, status: statuses[0]._id },
      { name: 'arrivalDate', label: 'Intended Arrival Date', type: 'date', required: true, order: 2, formSection: canadaTouristTravel._id, status: statuses[0]._id },
      { name: 'departureDate', label: 'Intended Departure Date', type: 'date', required: true, order: 3, formSection: canadaTouristTravel._id, status: statuses[0]._id },
      { name: 'fundsAvailable', label: 'Funds Available for Trip (CAD)', type: 'number', required: true, order: 4, formSection: canadaTouristTravel._id, status: statuses[0]._id }
    ]);

    console.log('✅ Database seeded successfully with proper relationships!');
    console.log('📊 Created:');
    console.log('- 26 Statuses');
    console.log('- 4 Roles');
    console.log('- 6 Users');
    console.log('- 6 Continents');
    console.log('- 10 Countries');
    console.log('- 6 Visa Types');
    console.log('- 13 Country-Visa combinations');
    console.log('- 3 Country Terms & Conditions');
    console.log('- 2 Visa Terms & Conditions');
    console.log('- 12 Form Sections');
    console.log('- 60+ Form Fields');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / manager123');
    console.log('Employee: employee@example.com / employee123');
    console.log('Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

seedDatabase();