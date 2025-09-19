require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Status = require('./models/Status');
const Continent = require('./models/Continent');
const Country = require('./models/Country');
const VisaType = require('./models/VisaType');
const CountryVisaType = require('./models/CountryVisaType');
const FormSection = require('./models/FormSection');
const FormField = require('./models/FormField');

const seedVisaFormData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting visa form data seeding...');

    // Get active status
    const activeStatus = await Status.findOne({ name: 'active' });
    if (!activeStatus) {
      console.error('❌ Active status not found. Please run main seed first.');
      return;
    }

    // Get Asia continent
    let asiaContinent = await Continent.findOne({ name: 'Asia' });
    if (!asiaContinent) {
      asiaContinent = await Continent.create({
        name: 'Asia',
        slug: 'asia',
        description: 'Asian continent',
        status: activeStatus._id
      });
    }

    // Create countries
    const countries = [
      { name: 'United States', code: 'US', slug: 'united-states', description: 'United States of America', processingTimeMin: '10', processingTimeMax: '30' },
      { name: 'United Kingdom', code: 'UK', slug: 'united-kingdom', description: 'United Kingdom', processingTimeMin: '5', processingTimeMax: '15' },
      { name: 'Canada', code: 'CA', slug: 'canada', description: 'Canada', processingTimeMin: '7', processingTimeMax: '21' },
      { name: 'Australia', code: 'AU', slug: 'australia', description: 'Australia', processingTimeMin: '15', processingTimeMax: '30' },
      { name: 'Germany', code: 'DE', slug: 'germany', description: 'Germany', processingTimeMin: '5', processingTimeMax: '10' }
    ];

    const createdCountries = [];
    for (const countryData of countries) {
      let country = await Country.findOne({ code: countryData.code });
      if (!country) {
        country = await Country.create({
          ...countryData,
          continent: asiaContinent._id,
          status: activeStatus._id
        });
      }
      createdCountries.push(country);
    }

    // Create visa types
    const visaTypes = [
      { name: 'Tourist Visa', description: 'For tourism and leisure travel', basePrice: 150 },
      { name: 'Business Visa', description: 'For business meetings and conferences', basePrice: 200 },
      { name: 'Student Visa', description: 'For educational purposes', basePrice: 300 },
      { name: 'Work Visa', description: 'For employment purposes', basePrice: 500 },
      { name: 'Transit Visa', description: 'For transit through the country', basePrice: 75 }
    ];

    const createdVisaTypes = [];
    for (const visaData of visaTypes) {
      let visaType = await VisaType.findOne({ name: visaData.name });
      if (!visaType) {
        visaType = await VisaType.create({
          ...visaData,
          status: activeStatus._id
        });
      }
      createdVisaTypes.push(visaType);
    }

    // Create country visa types with pricing
    const countryVisaData = [
      { 
        country: 'United States', 
        visa: 'Tourist Visa', 
        name: 'US Tourist Visa',
        description: 'Tourist visa for United States',
        vfsAmount: '35',
        consulateAmount: '160',
        serviceAmount: '25',
        totalAmount: '220',
        processingTimeMin: '10',
        processingTimeMax: '15'
      },
      { 
        country: 'United States', 
        visa: 'Business Visa', 
        name: 'US Business Visa',
        description: 'Business visa for United States',
        vfsAmount: '35',
        consulateAmount: '160',
        serviceAmount: '30',
        totalAmount: '225',
        processingTimeMin: '10',
        processingTimeMax: '15'
      },
      { 
        country: 'United Kingdom', 
        visa: 'Tourist Visa', 
        name: 'UK Tourist Visa',
        description: 'Tourist visa for United Kingdom',
        vfsAmount: '25',
        consulateAmount: '95',
        serviceAmount: '20',
        totalAmount: '140',
        processingTimeMin: '5',
        processingTimeMax: '10'
      },
      { 
        country: 'Canada', 
        visa: 'Tourist Visa', 
        name: 'Canada Tourist Visa',
        description: 'Tourist visa for Canada',
        vfsAmount: '30',
        consulateAmount: '100',
        serviceAmount: '25',
        totalAmount: '155',
        processingTimeMin: '7',
        processingTimeMax: '14'
      }
    ];

    for (const cvData of countryVisaData) {
      const country = createdCountries.find(c => c.name === cvData.country);
      const visaType = createdVisaTypes.find(v => v.name === cvData.visa);
      
      if (country && visaType) {
        const existing = await CountryVisaType.findOne({
          country: country._id,
          visaType: visaType._id
        });
        
        if (!existing) {
          await CountryVisaType.create({
            name: cvData.name,
            description: cvData.description,
            country: country._id,
            visaType: visaType._id,
            vfsAmount: cvData.vfsAmount,
            consulateAmount: cvData.consulateAmount,
            serviceAmount: cvData.serviceAmount,
            totalAmount: cvData.totalAmount,
            processingTimeMin: cvData.processingTimeMin,
            processingTimeMax: cvData.processingTimeMax,
            status: activeStatus._id
          });
        }
      }
    }

    // Create form sections for US Tourist Visa
    const usCountry = createdCountries.find(c => c.name === 'United States');
    const touristVisa = createdVisaTypes.find(v => v.name === 'Tourist Visa');
    const usTouristVisa = await CountryVisaType.findOne({
      country: usCountry._id,
      visaType: touristVisa._id
    });

    if (usTouristVisa) {
      const formSections = [
        { name: 'Personal Information', description: 'Basic personal details', order: 1 },
        { name: 'Contact Information', description: 'Contact details and address', order: 2 },
        { name: 'Travel Information', description: 'Travel plans and purpose', order: 3 },
        { name: 'Background Information', description: 'Background and security questions', order: 4 },
        { name: 'Documents', description: 'Required documents upload', order: 5 }
      ];

      const createdSections = [];
      for (const sectionData of formSections) {
        let section = await FormSection.findOne({ name: sectionData.name });
        if (!section) {
          section = await FormSection.create({
            ...sectionData,
            status: activeStatus._id
          });
        }
        createdSections.push(section);
      }

      // Create form fields
      const formFields = [
        // Personal Information
        { section: 'Personal Information', name: 'firstName', label: 'First Name', type: 'text', required: true, order: 1, placeholder: 'Enter your first name' },
        { section: 'Personal Information', name: 'lastName', label: 'Last Name', type: 'text', required: true, order: 2, placeholder: 'Enter your last name' },
        { section: 'Personal Information', name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 3 },
        { section: 'Personal Information', name: 'gender', label: 'Gender', type: 'select', required: true, order: 4 },
        { section: 'Personal Information', name: 'nationality', label: 'Nationality', type: 'select', required: true, order: 5 },
        { section: 'Personal Information', name: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 6, placeholder: 'Enter passport number' },
        { section: 'Personal Information', name: 'passportExpiry', label: 'Passport Expiry Date', type: 'date', required: true, order: 7 },
        
        // Contact Information
        { section: 'Contact Information', name: 'email', label: 'Email Address', type: 'email', required: true, order: 1, placeholder: 'Enter your email' },
        { section: 'Contact Information', name: 'phone', label: 'Phone Number', type: 'tel', required: true, order: 2, placeholder: 'Enter phone number' },
        { section: 'Contact Information', name: 'address', label: 'Home Address', type: 'textarea', required: true, order: 3, placeholder: 'Enter your full address' },
        { section: 'Contact Information', name: 'city', label: 'City', type: 'text', required: true, order: 4, placeholder: 'Enter city' },
        { section: 'Contact Information', name: 'postalCode', label: 'Postal Code', type: 'text', required: true, order: 5, placeholder: 'Enter postal code' },
        
        // Travel Information
        { section: 'Travel Information', name: 'purposeOfVisit', label: 'Purpose of Visit', type: 'select', required: true, order: 1 },
        { section: 'Travel Information', name: 'arrivalDate', label: 'Intended Arrival Date', type: 'date', required: true, order: 2 },
        { section: 'Travel Information', name: 'departureDate', label: 'Intended Departure Date', type: 'date', required: true, order: 3 },
        { section: 'Travel Information', name: 'accommodation', label: 'Accommodation Details', type: 'textarea', required: true, order: 4, placeholder: 'Hotel name and address' },
        { section: 'Travel Information', name: 'financialSupport', label: 'Financial Support', type: 'select', required: true, order: 5 },
        
        // Background Information
        { section: 'Background Information', name: 'previousVisas', label: 'Have you been issued a US visa before?', type: 'radio', required: true, order: 1 },
        { section: 'Background Information', name: 'visaRefusal', label: 'Have you ever been refused a US visa?', type: 'radio', required: true, order: 2 },
        { section: 'Background Information', name: 'criminalHistory', label: 'Do you have any criminal history?', type: 'radio', required: true, order: 3 },
        { section: 'Background Information', name: 'medicalConditions', label: 'Do you have any serious medical conditions?', type: 'radio', required: true, order: 4 },
        
        // Documents
        { section: 'Documents', name: 'passportCopy', label: 'Passport Copy', type: 'file', required: true, order: 1 },
        { section: 'Documents', name: 'photograph', label: 'Passport Size Photograph', type: 'file', required: true, order: 2 },
        { section: 'Documents', name: 'bankStatement', label: 'Bank Statement (Last 3 months)', type: 'file', required: true, order: 3 },
        { section: 'Documents', name: 'travelItinerary', label: 'Travel Itinerary', type: 'file', required: false, order: 4 },
        { section: 'Documents', name: 'employmentLetter', label: 'Employment Letter', type: 'file', required: false, order: 5 }
      ];

      for (const fieldData of formFields) {
        const section = createdSections.find(s => s.name === fieldData.section);
        if (section) {
          const existing = await FormField.findOne({ name: fieldData.name });
          if (!existing) {
            await FormField.create({
              name: fieldData.name,
              label: fieldData.label,
              type: fieldData.type,
              placeholder: fieldData.placeholder || '',
              required: fieldData.required,
              order: fieldData.order,
              formSection: section._id,
              status: activeStatus._id
            });
          }
        }
      }
    }

    console.log('✅ Visa form data seeded successfully!');
    console.log('📊 Created:');
    console.log(`   - ${createdCountries.length} countries`);
    console.log(`   - ${createdVisaTypes.length} visa types`);
    console.log(`   - ${countryVisaData.length} country-visa combinations`);
    console.log(`   - 5 form sections`);
    console.log(`   - 25 form fields`);
    
  } catch (error) {
    console.error('❌ Error seeding visa form data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedVisaFormData();