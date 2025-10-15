const mongoose = require('mongoose');
require('dotenv').config();

async function fixPaymentIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // Drop existing transactionId index
    try {
      await collection.dropIndex('transactionId_1');
      console.log('Dropped existing transactionId index');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }

    // Create new sparse unique index
    await collection.createIndex(
      { transactionId: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new sparse unique index for transactionId');

    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixPaymentIndex();