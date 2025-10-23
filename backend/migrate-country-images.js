require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./src/models/Country');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-management');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateCountryImages = async () => {
  try {
    await connectDB();
    
    // Update all countries to remove flagEmoji field and set placeImage to null
    const result = await Country.updateMany(
      {},
      { 
        $unset: { flagEmoji: "" },
        $set: { placeImage: null }
      }
    );
    
    console.log(`Migration completed. Updated ${result.modifiedCount} countries.`);
    console.log('All countries now have placeImage field instead of flagEmoji.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateCountryImages();