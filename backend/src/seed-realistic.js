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
    // await Promise.all([
    //   User.deleteMany({}),
    //   Role.deleteMany({}),
    //   Status.deleteMany({}),
    //   Continent.deleteMany({}),
    //   Country.deleteMany({}),
    //   VisaType.deleteMany({}),
    //   CountryVisaType.deleteMany({}),
    //   CountryTermsConditions.deleteMany({}),
    //   VisaTermsConditions.deleteMany({}),
    //   FormSection.deleteMany({}),
    //   FormField.deleteMany({})
    // ]);

    // 1. Create Statuses
    //  const roles = await Role.insertMany([
    //   {
    //     name: 'admin',
    //     permissions: ['dashboard', 'roles', 'users', 'status', 'settings', 'continents', 'countries', 'visa-types', 'country-visa-types', 'country-terms-conditions', 'visa-terms-conditions', 'applications'],
    //     description: 'Full system access',
    //     isActive: true
    //   },
    //   {
    //     name: 'manager',
    //     permissions: ['dashboard', 'users', 'status'],
    //     description: 'Manage users and status',
    //     isActive: true
    //   },
    //   {
    //     name: 'employee',
    //     permissions: ['users'],
    //     description: 'Manage customers only',
    //     isActive: true
    //   },
    //   {
    //     name: 'customer',
    //     permissions: ['dashboard'],
    //     description: 'View dashboard only',
    //     isActive: true
    //   }
    // ]);

    // Create Statuses
    const statuses = await Status.insertMany([
      // General System Statuses
      // {
      //   name: 'active',
      //   description: 'Active and operational',
      //   color: '#10B981',
      //   isActive: true
      // },
      // {
      //   name: 'inactive',
      //   description: 'Inactive or disabled',
      //   color: '#EF4444',
      //   isActive: true
      // },
      // {
      //   name: 'pending',
      //   description: 'Pending approval or processing',
      //   color: '#F59E0B',
      //   isActive: true
      // },
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
    // const users = await User.insertMany([
    //   { name: 'System Administrator', email: 'admin@example.com', password: hashedPassword, role: roles[0]._id, status: statuses[0]._id },
    //   { name: 'John Manager', email: 'manager@example.com', password: await bcrypt.hash('manager123', 10), role: roles[1]._id, status: statuses[0]._id },
    //   { name: 'Sarah Employee', email: 'employee@example.com', password: await bcrypt.hash('employee123', 10), role: roles[2]._id, status: statuses[0]._id },
    //   { name: 'Mike Customer', email: 'customer@example.com', password: await bcrypt.hash('customer123', 10), role: roles[3]._id, status: statuses[0]._id },
    //   { name: 'Alice Johnson', email: 'alice@example.com', password: await bcrypt.hash('customer123', 10), role: roles[3]._id, status: statuses[0]._id },
    //   { name: 'Bob Smith', email: 'bob@example.com', password: await bcrypt.hash('customer123', 10), role: roles[3]._id, status: statuses[1]._id }
    // ]);

    // // 4. Create Continents
    // const continents = await Continent.insertMany([
    //   { name: 'Asia', slug: 'asia', description: 'The largest continent', status: statuses[0]._id },
    //   { name: 'Europe', slug: 'europe', description: 'A continent of rich history', status: statuses[0]._id },
    //   { name: 'North America', slug: 'north-america', description: 'Northern part of Americas', status: statuses[0]._id },
    //   { name: 'South America', slug: 'south-america', description: 'Southern part of Americas', status: statuses[0]._id },
    //   { name: 'Africa', slug: 'africa', description: 'Second largest continent', status: statuses[0]._id },
    //   { name: 'Oceania', slug: 'oceania', description: 'Australia and Pacific islands', status: statuses[0]._id }
    // ]);

    // // 5. Create Countries
    // const countries = await Country.insertMany([
    //   { name: 'United States', slug: 'united-states', description: 'Federal republic in North America', code: 'US', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '8 weeks', status: statuses[0]._id },
    //   { name: 'Canada', slug: 'canada', description: 'Country in North America', code: 'CA', continent: continents[2]._id, processingTimeMin: '2 weeks', processingTimeMax: '12 weeks', status: statuses[0]._id },
    //   { name: 'United Kingdom', slug: 'united-kingdom', description: 'Sovereign country in Europe', code: 'GB', continent: continents[1]._id, processingTimeMin: '3 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
    //   { name: 'Germany', slug: 'germany', description: 'Country in Central Europe', code: 'DE', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '6 weeks', status: statuses[0]._id },
    //   { name: 'France', slug: 'france', description: 'Country in Western Europe', code: 'FR', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', status: statuses[0]._id },
    //   { name: 'Australia', slug: 'australia', description: 'Country and continent in Oceania', code: 'AU', continent: continents[5]._id, processingTimeMin: '15 days', processingTimeMax: '4 months', status: statuses[0]._id },
    //   { name: 'Japan', slug: 'japan', description: 'Island country in East Asia', code: 'JP', continent: continents[0]._id, processingTimeMin: '5 days', processingTimeMax: '2 weeks', status: statuses[0]._id },
    //   { name: 'Singapore', slug: 'singapore', description: 'City-state in Southeast Asia', code: 'SG', continent: continents[0]._id, processingTimeMin: '3 days', processingTimeMax: '1 week', status: statuses[0]._id },
    //   { name: 'Italy', slug: 'italy', description: 'Country in Southern Europe', code: 'IT', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '5 weeks', status: statuses[0]._id },
    //   { name: 'Spain', slug: 'spain', description: 'Country in Southwestern Europe', code: 'ES', continent: continents[1]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', status: statuses[0]._id }
    // ]);

    // // 6. Create Visa Types
    // const visaTypes = await VisaType.insertMany([
    //   { name: 'Tourist Visa', code: 'TOURIST', description: 'For tourism and leisure travel', status: statuses[0]._id },
    //   { name: 'Student Visa', code: 'STUDENT', description: 'For academic studies', status: statuses[0]._id },
    //   { name: 'Work Visa', code: 'WORK', description: 'For employment purposes', status: statuses[0]._id },
    //   { name: 'Business Visa', code: 'BUSINESS', description: 'For business activities', status: statuses[0]._id },
    //   { name: 'Transit Visa', code: 'TRANSIT', description: 'For transit through country', status: statuses[0]._id },
    //   { name: 'Family Visa', code: 'FAMILY', description: 'For family reunification', status: statuses[0]._id }
    // ]);

    // // 7. Create Country Visa Types
    // const countryVisaTypes = await CountryVisaType.insertMany([
    //   // USA
    //   { name: 'USA Tourist Visa (B1/B2)', country: countries[0]._id, visaType: visaTypes[0]._id, processingTimeMin: '3 weeks', processingTimeMax: '5 weeks', totalAmount: '235', agentDiscount: '10', status: statuses[0]._id },
    //   { name: 'USA Student Visa (F1)', country: countries[0]._id, visaType: visaTypes[1]._id, processingTimeMin: '2 months', processingTimeMax: '3 months', totalAmount: '450', agentDiscount: '15', status: statuses[0]._id },
    //   { name: 'USA Work Visa (H1B)', country: countries[0]._id, visaType: visaTypes[2]._id, processingTimeMin: '1 month', processingTimeMax: '3 months', totalAmount: '275', agentDiscount: '12', status: statuses[0]._id },
      
    //   // Canada
    //   { name: 'Canada Tourist Visa (TRV)', country: countries[1]._id, visaType: visaTypes[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '175', agentDiscount: '8', status: statuses[0]._id },
    //   { name: 'Canada Student Visa', country: countries[1]._id, visaType: visaTypes[1]._id, processingTimeMin: '4 weeks', processingTimeMax: '6 weeks', totalAmount: '235', agentDiscount: '10', status: statuses[0]._id },
      
    //   // UK
    //   { name: 'UK Tourist Visa (Standard)', country: countries[2]._id, visaType: visaTypes[0]._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '190', agentDiscount: '9', status: statuses[0]._id },
    //   { name: 'UK Student Visa (Tier 4)', country: countries[2]._id, visaType: visaTypes[1]._id, processingTimeMin: '3 weeks', processingTimeMax: '3 weeks', totalAmount: '468', agentDiscount: '20', status: statuses[0]._id },
      
    //   // Germany
    //   { name: 'Germany Tourist Visa (Schengen)', country: countries[3]._id, visaType: visaTypes[0]._id, processingTimeMin: '2 weeks', processingTimeMax: '4 weeks', totalAmount: '150', agentDiscount: '7', status: statuses[0]._id },
    //   { name: 'Germany Student Visa', country: countries[3]._id, visaType: visaTypes[1]._id, processingTimeMin: '4 weeks', processingTimeMax: '8 weeks', totalAmount: '150', agentDiscount: '7', status: statuses[0]._id },
      
    //   // Australia
    //   { name: 'Australia Tourist Visa (600)', country: countries[5]._id, visaType: visaTypes[0]._id, processingTimeMin: '15 days', processingTimeMax: '20 days', totalAmount: '230', agentDiscount: '10', status: statuses[0]._id },
    //   { name: 'Australia Student Visa (500)', country: countries[5]._id, visaType: visaTypes[1]._id, processingTimeMin: '1 month', processingTimeMax: '4 months', totalAmount: '735', agentDiscount: '25', status: statuses[0]._id },
      
    //   // Japan
    //   { name: 'Japan Tourist Visa', country: countries[6]._id, visaType: visaTypes[0]._id, processingTimeMin: '5 days', processingTimeMax: '1 week', totalAmount: '75', agentDiscount: '5', status: statuses[0]._id },
    //   { name: 'Japan Student Visa', country: countries[6]._id, visaType: visaTypes[1]._id, processingTimeMin: '1 week', processingTimeMax: '2 weeks', totalAmount: '80', agentDiscount: '5', status: statuses[0]._id }
    // ]);

    // // 8. Create Country Terms & Conditions
    // await CountryTermsConditions.insertMany([
    //   {
    //     country: countries[0]._id,
    //     title: 'USA General Visa Requirements',
    //     content: `
    //       <h3>General Requirements for All USA Visas</h3>
    //       <ul>
    //         <li>Valid passport with at least 6 months validity beyond intended stay</li>
    //         <li>Completed DS-160 online application form</li>
    //         <li>Visa application fee payment receipt</li>
    //         <li>Recent passport-style photograph</li>
    //         <li>Supporting documents specific to visa type</li>
    //       </ul>
          
    //       <h3>Interview Requirements</h3>
    //       <p>Most applicants between ages 14-79 must attend a visa interview at a US Embassy or Consulate.</p>
          
    //       <h3>Processing Time</h3>
    //       <p>Processing times vary by location and season. Check current wait times on the embassy website.</p>
          
    //       <h3>Important Notes</h3>
    //       <ul>
    //         <li>Visa approval is not guaranteed</li>
    //         <li>Having a visa does not guarantee entry to the US</li>
    //         <li>All fees are non-refundable regardless of visa decision</li>
    //       </ul>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     country: countries[1]._id,
    //     title: 'Canada General Visa Requirements',
    //     content: `
    //       <h3>Standard Requirements for Canada Visas</h3>
    //       <ul>
    //         <li>Valid passport or travel document</li>
    //         <li>Completed application form</li>
    //         <li>Proof of financial support</li>
    //         <li>Travel itinerary and accommodation details</li>
    //         <li>Letter of invitation (if applicable)</li>
    //       </ul>
          
    //       <h3>Biometrics</h3>
    //       <p>Most applicants must provide biometrics (fingerprints and photo) at a Visa Application Centre.</p>
          
    //       <h3>Medical Examinations</h3>
    //       <p>May be required depending on your country of residence and length of stay.</p>
          
    //       <h3>Processing Standards</h3>
    //       <p>Most applications are processed within a few weeks, but processing times may vary.</p>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     country: countries[2]._id,
    //     title: 'UK General Visa Requirements',
    //     content: `
    //       <h3>Standard Requirements for UK Visas</h3>
    //       <ul>
    //         <li>Valid passport or travel document</li>
    //         <li>Completed online application</li>
    //         <li>Proof of financial support</li>
    //         <li>Accommodation details</li>
    //         <li>Travel insurance (recommended)</li>
    //       </ul>
          
    //       <h3>Biometric Information</h3>
    //       <p>You'll need to provide biometric information (fingerprints and photograph) at a visa application centre.</p>
          
    //       <h3>Supporting Documents</h3>
    //       <p>You must provide supporting documents in English or with certified translations.</p>
          
    //       <h3>Decision Timeline</h3>
    //       <p>Standard processing time is 3 weeks for applications from outside the UK.</p>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     country: countries[3]._id,
    //     title: 'Germany Schengen Visa Requirements',
    //     content: `
    //       <h3>Schengen Visa General Requirements</h3>
    //       <ul>
    //         <li>Valid passport (issued within last 10 years, valid for at least 3 months after intended departure)</li>
    //         <li>Completed Schengen visa application form</li>
    //         <li>Recent passport photographs</li>
    //         <li>Travel insurance covering €30,000 minimum</li>
    //         <li>Proof of accommodation</li>
    //         <li>Flight itinerary</li>
    //       </ul>
          
    //       <h3>Financial Requirements</h3>
    //       <p>Proof of sufficient funds (approximately €45 per day for Germany).</p>
          
    //       <h3>Schengen Area Access</h3>
    //       <p>This visa allows travel to all 26 Schengen countries for up to 90 days within 180 days.</p>
    //     `,
    //     status: statuses[0]._id
    //   }
    // ]);

    // // 9. Create Visa Terms & Conditions
    // await VisaTermsConditions.insertMany([
    //   {
    //     countryVisaType: countryVisaTypes[0]._id,
    //     title: 'USA Tourist Visa (B1/B2) Terms & Conditions',
    //     content: `
    //       <h3>Purpose of Visit</h3>
    //       <p>This visa is for temporary visits to the United States for business (B1) or tourism/pleasure (B2).</p>
          
    //       <h3>Permitted Activities</h3>
    //       <ul>
    //         <li>Tourism and sightseeing</li>
    //         <li>Visiting friends and relatives</li>
    //         <li>Medical treatment</li>
    //         <li>Attending conferences or business meetings</li>
    //         <li>Short-term courses (less than 18 hours per week)</li>
    //       </ul>
          
    //       <h3>Prohibited Activities</h3>
    //       <ul>
    //         <li>Employment or work for pay</li>
    //         <li>Enrollment in full-time study</li>
    //         <li>Permanent residence</li>
    //         <li>Representing foreign media</li>
    //       </ul>
          
    //       <h3>Duration of Stay</h3>
    //       <p>Maximum initial stay of 6 months, with possible extension. Multiple entries allowed during visa validity period.</p>
          
    //       <h3>Financial Requirements</h3>
    //       <p>You must demonstrate sufficient funds to cover your entire stay without working in the US.</p>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     countryVisaType: countryVisaTypes[1]._id,
    //     title: 'USA Student Visa (F1) Requirements',
    //     content: `
    //       <h3>Educational Requirements</h3>
    //       <ul>
    //         <li>Acceptance letter from SEVIS-approved institution</li>
    //         <li>Form I-20 issued by your school</li>
    //         <li>Payment of SEVIS fee</li>
    //         <li>Proof of English proficiency (if required)</li>
    //       </ul>
          
    //       <h3>Financial Documentation</h3>
    //       <ul>
    //         <li>Bank statements showing sufficient funds</li>
    //         <li>Scholarship letters (if applicable)</li>
    //         <li>Sponsor affidavit of support</li>
    //         <li>Proof of fee payment to the institution</li>
    //       </ul>
          
    //       <h3>Academic Requirements</h3>
    //       <ul>
    //         <li>Must maintain full-time enrollment</li>
    //         <li>Cannot work off-campus without authorization</li>
    //         <li>Must maintain valid immigration status</li>
    //       </ul>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     countryVisaType: countryVisaTypes[3]._id,
    //     title: 'Canada Tourist Visa (TRV) Terms',
    //     content: `
    //       <h3>Visitor Visa Requirements</h3>
    //       <p>This visa allows you to visit Canada for tourism, visiting family/friends, or business purposes.</p>
          
    //       <h3>Permitted Activities</h3>
    //       <ul>
    //         <li>Tourism and leisure travel</li>
    //         <li>Visiting family and friends</li>
    //         <li>Business meetings and conferences</li>
    //         <li>Short-term courses (6 months or less)</li>
    //       </ul>
          
    //       <h3>Duration and Validity</h3>
    //       <p>Usually valid for up to 10 years or until passport expires. Each visit can be up to 6 months.</p>
          
    //       <h3>Health and Character Requirements</h3>
    //       <p>You may need a medical exam and police certificates depending on your country of residence.</p>
    //     `,
    //     status: statuses[0]._id
    //   },
    //   {
    //     countryVisaType: countryVisaTypes[5]._id,
    //     title: 'UK Tourist Visa (Standard Visitor) Terms',
    //     content: `
    //       <h3>Standard Visitor Visa</h3>
    //       <p>This visa allows you to visit the UK for tourism, business, or to visit family and friends.</p>
          
    //       <h3>What You Can Do</h3>
    //       <ul>
    //         <li>Tourism and leisure activities</li>
    //         <li>Visit family and friends</li>
    //         <li>Business meetings and conferences</li>
    //         <li>Short-term study (up to 30 days)</li>
    //         <li>Medical treatment</li>
    //       </ul>
          
    //       <h3>Duration of Stay</h3>
    //       <p>You can stay for up to 6 months. The visa is usually valid for 6 months, 2 years, 5 years, or 10 years.</p>
          
    //       <h3>Financial Requirements</h3>
    //       <p>You must show you have enough money to support yourself during your visit and pay for your return journey.</p>
    //     `,
    //     status: statuses[0]._id
    //   }
    // ]);

    // // 10. Create Form Sections and Fields with proper relationships
    
    // // USA Tourist Visa Form Sections
    // const usaTouristPersonal = await FormSection.create({
    //   name: 'Personal Information',
    //   description: 'Basic personal details of the applicant',
    //   order: 1,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: usaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'middleName', label: 'Middle Name', type: 'text', required: false, order: 2, formSection: usaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 3, formSection: usaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 4, formSection: usaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true, order: 5, formSection: usaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'nationality', label: 'Nationality', type: 'select', required: true, order: 6, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Indian', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Japanese', 'Chinese', 'Other'] },
    //   { name: 'gender', label: 'Gender', type: 'radio', required: true, order: 7, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Male', 'Female', 'Other'] },
    //   { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: true, order: 8, formSection: usaTouristPersonal._id, status: statuses[0]._id, options: ['Single', 'Married', 'Divorced', 'Widowed'] }
    // ]);

    // const usaTouristPassport = await FormSection.create({
    //   name: 'Passport Information',
    //   description: 'Details about your passport',
    //   order: 2,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 1, formSection: usaTouristPassport._id, status: statuses[0]._id },
    //   { name: 'passportIssueDate', label: 'Issue Date', type: 'date', required: true, order: 2, formSection: usaTouristPassport._id, status: statuses[0]._id },
    //   { name: 'passportExpiryDate', label: 'Expiry Date', type: 'date', required: true, order: 3, formSection: usaTouristPassport._id, status: statuses[0]._id },
    //   { name: 'issuingAuthority', label: 'Issuing Authority', type: 'text', required: true, order: 4, formSection: usaTouristPassport._id, status: statuses[0]._id },
    //   { name: 'previousPassports', label: 'Do you have previous passports?', type: 'radio', required: true, order: 5, formSection: usaTouristPassport._id, status: statuses[0]._id, options: ['Yes', 'No'] }
    // ]);

    // const usaTouristContact = await FormSection.create({
    //   name: 'Contact Information',
    //   description: 'Your contact details and address',
    //   order: 3,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'email', label: 'Email Address', type: 'email', required: true, order: 1, formSection: usaTouristContact._id, status: statuses[0]._id },
    //   { name: 'phone', label: 'Phone Number', type: 'tel', required: true, order: 2, formSection: usaTouristContact._id, status: statuses[0]._id },
    //   { name: 'address', label: 'Home Address', type: 'textarea', required: true, order: 3, formSection: usaTouristContact._id, status: statuses[0]._id },
    //   { name: 'city', label: 'City', type: 'text', required: true, order: 4, formSection: usaTouristContact._id, status: statuses[0]._id },
    //   { name: 'state', label: 'State/Province', type: 'text', required: true, order: 5, formSection: usaTouristContact._id, status: statuses[0]._id },
    //   { name: 'postalCode', label: 'Postal Code', type: 'text', required: true, order: 6, formSection: usaTouristContact._id, status: statuses[0]._id }
    // ]);

    // const usaTouristTravel = await FormSection.create({
    //   name: 'Travel Information',
    //   description: 'Details about your planned travel',
    //   order: 4,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'select', required: true, order: 1, formSection: usaTouristTravel._id, status: statuses[0]._id, options: ['Tourism', 'Business', 'Medical Treatment', 'Visiting Friends/Family', 'Transit', 'Other'] },
    //   { name: 'intendedArrivalDate', label: 'Intended Arrival Date', type: 'date', required: true, order: 2, formSection: usaTouristTravel._id, status: statuses[0]._id },
    //   { name: 'intendedDepartureDate', label: 'Intended Departure Date', type: 'date', required: true, order: 3, formSection: usaTouristTravel._id, status: statuses[0]._id },
    //   { name: 'accommodationType', label: 'Accommodation Type', type: 'select', required: true, order: 4, formSection: usaTouristTravel._id, status: statuses[0]._id, options: ['Hotel', 'Airbnb', 'Friends/Family', 'Hostel', 'Other'] },
    //   { name: 'accommodationAddress', label: 'Accommodation Address', type: 'textarea', required: true, order: 5, formSection: usaTouristTravel._id, status: statuses[0]._id }
    // ]);

    // const usaTouristEmployment = await FormSection.create({
    //   name: 'Employment Information',
    //   description: 'Your current employment details',
    //   order: 5,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'employmentStatus', label: 'Employment Status', type: 'select', required: true, order: 1, formSection: usaTouristEmployment._id, status: statuses[0]._id, options: ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired', 'Other'] },
    //   { name: 'employerName', label: 'Employer Name', type: 'text', required: false, order: 2, formSection: usaTouristEmployment._id, status: statuses[0]._id },
    //   { name: 'jobTitle', label: 'Job Title', type: 'text', required: false, order: 3, formSection: usaTouristEmployment._id, status: statuses[0]._id },
    //   { name: 'monthlyIncome', label: 'Monthly Income (USD)', type: 'number', required: false, order: 4, formSection: usaTouristEmployment._id, status: statuses[0]._id }
    // ]);

    // const usaTouristFinancial = await FormSection.create({
    //   name: 'Financial Information',
    //   description: 'Financial support and funding details',
    //   order: 6,
    //   countryVisaType: countryVisaTypes[0]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'bankBalance', label: 'Current Bank Balance (USD)', type: 'number', required: true, order: 1, formSection: usaTouristFinancial._id, status: statuses[0]._id },
    //   { name: 'fundingSource', label: 'Who is funding your trip?', type: 'select', required: true, order: 2, formSection: usaTouristFinancial._id, status: statuses[0]._id, options: ['Self', 'Family', 'Employer', 'Sponsor', 'Other'] },
    //   { name: 'estimatedTripCost', label: 'Estimated Trip Cost (USD)', type: 'number', required: true, order: 3, formSection: usaTouristFinancial._id, status: statuses[0]._id }
    // ]);

    // // UK Student Visa Form Sections
    // const ukStudentPersonal = await FormSection.create({
    //   name: 'Personal Information',
    //   description: 'Basic personal details of the student applicant',
    //   order: 1,
    //   countryVisaType: countryVisaTypes[6]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: ukStudentPersonal._id, status: statuses[0]._id },
    //   { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 2, formSection: ukStudentPersonal._id, status: statuses[0]._id },
    //   { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 3, formSection: ukStudentPersonal._id, status: statuses[0]._id },
    //   { name: 'nationality', label: 'Nationality', type: 'select', required: true, order: 4, formSection: ukStudentPersonal._id, status: statuses[0]._id },
    //   { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 5, formSection: ukStudentPersonal._id, status: statuses[0]._id }
    // ]);

    // const ukStudentEducation = await FormSection.create({
    //   name: 'Education Information',
    //   description: 'Your educational background and UK study plans',
    //   order: 2,
    //   countryVisaType: countryVisaTypes[6]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'ukInstitution', label: 'UK Institution Name', type: 'text', required: true, order: 1, formSection: ukStudentEducation._id, status: statuses[0]._id },
    //   { name: 'courseTitle', label: 'Course Title', type: 'text', required: true, order: 2, formSection: ukStudentEducation._id, status: statuses[0]._id },
    //   { name: 'courseLevel', label: 'Course Level', type: 'select', required: true, order: 3, formSection: ukStudentEducation._id, status: statuses[0]._id },
    //   { name: 'courseStartDate', label: 'Course Start Date', type: 'date', required: true, order: 4, formSection: ukStudentEducation._id, status: statuses[0]._id },
    //   { name: 'courseDuration', label: 'Course Duration (months)', type: 'number', required: true, order: 5, formSection: ukStudentEducation._id, status: statuses[0]._id },
    //   { name: 'casNumber', label: 'CAS Number', type: 'text', required: true, order: 6, formSection: ukStudentEducation._id, status: statuses[0]._id }
    // ]);

    // const ukStudentFinancial = await FormSection.create({
    //   name: 'Financial Information',
    //   description: 'Proof of financial support for your studies',
    //   order: 3,
    //   countryVisaType: countryVisaTypes[6]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'tuitionFees', label: 'Annual Tuition Fees (GBP)', type: 'number', required: true, order: 1, formSection: ukStudentFinancial._id, status: statuses[0]._id },
    //   { name: 'livingCosts', label: 'Annual Living Costs (GBP)', type: 'number', required: true, order: 2, formSection: ukStudentFinancial._id, status: statuses[0]._id },
    //   { name: 'financialSponsor', label: 'Financial Sponsor', type: 'select', required: true, order: 3, formSection: ukStudentFinancial._id, status: statuses[0]._id },
    //   { name: 'bankBalance', label: 'Available Funds (GBP)', type: 'number', required: true, order: 4, formSection: ukStudentFinancial._id, status: statuses[0]._id }
    // ]);

    // // Canada Tourist Visa Form Sections
    // const canadaTouristPersonal = await FormSection.create({
    //   name: 'Personal Information',
    //   description: 'Personal details for Canada visitor visa',
    //   order: 1,
    //   countryVisaType: countryVisaTypes[3]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 2, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 3, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'citizenship', label: 'Citizenship', type: 'text', required: true, order: 4, formSection: canadaTouristPersonal._id, status: statuses[0]._id },
    //   { name: 'maritalStatus', label: 'Marital Status', type: 'select', required: true, order: 5, formSection: canadaTouristPersonal._id, status: statuses[0]._id }
    // ]);

    // const canadaTouristTravel = await FormSection.create({
    //   name: 'Travel Details',
    //   description: 'Information about your planned visit to Canada',
    //   order: 2,
    //   countryVisaType: countryVisaTypes[3]._id,
    //   status: statuses[0]._id
    // });

    // await FormField.insertMany([
    //   { name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'select', required: true, order: 1, formSection: canadaTouristTravel._id, status: statuses[0]._id },
    //   { name: 'arrivalDate', label: 'Intended Arrival Date', type: 'date', required: true, order: 2, formSection: canadaTouristTravel._id, status: statuses[0]._id },
    //   { name: 'departureDate', label: 'Intended Departure Date', type: 'date', required: true, order: 3, formSection: canadaTouristTravel._id, status: statuses[0]._id },
    //   { name: 'fundsAvailable', label: 'Funds Available for Trip (CAD)', type: 'number', required: true, order: 4, formSection: canadaTouristTravel._id, status: statuses[0]._id }
    // ]);

    // console.log('✅ Database seeded successfully with proper relationships!');
    // console.log('📊 Created:');
    // console.log('- 26 Statuses');
    // console.log('- 4 Roles');
    // console.log('- 6 Users');
    // console.log('- 6 Continents');
    // console.log('- 10 Countries');
    // console.log('- 6 Visa Types');
    // console.log('- 13 Country-Visa combinations');
    // console.log('- 3 Country Terms & Conditions');
    // console.log('- 2 Visa Terms & Conditions');
    // console.log('- 12 Form Sections');
    // console.log('- 60+ Form Fields');
    // console.log('\n🔑 Login credentials:');
    // console.log('Admin: admin@example.com / admin123');
    // console.log('Manager: manager@example.com / manager123');
    // console.log('Employee: employee@example.com / employee123');
    // console.log('Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

seedDatabase();