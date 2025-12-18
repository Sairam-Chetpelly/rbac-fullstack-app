const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oneworldvisa');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const checkAndUpdateData = async () => {
  try {
    console.log('Checking visa types data...');

    // Check current visa types
    const visaTypes = await mongoose.connection.db.collection('visatypes').find({}).toArray();
    console.log(`Found ${visaTypes.length} visa types`);
    
    if (visaTypes.length > 0) {
      console.log('Sample visa type:', JSON.stringify(visaTypes[0], null, 2));
      
      // Update visa types to ensure isActive field exists
      const updateResult = await mongoose.connection.db.collection('visatypes').updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true }, $unset: { status: "" } }
      );
      console.log(`Updated ${updateResult.modifiedCount} visa types`);
      
      // Check after update
      const updatedVisaTypes = await mongoose.connection.db.collection('visatypes').find({}).toArray();
      console.log('Sample updated visa type:', JSON.stringify(updatedVisaTypes[0], null, 2));
    }

    console.log('Data check completed!');
    process.exit(0);
  } catch (error) {
    console.error('Data check failed:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await checkAndUpdateData();
};

run();