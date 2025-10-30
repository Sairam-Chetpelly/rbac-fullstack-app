const mongoose = require('mongoose');
const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const Status = require('../models/Status');

async function updateApplicationStatus() {
  try {
    console.log('Starting application status migration...');

    // Create default statuses if they don't exist
    const defaultStatuses = [
      { name: 'Draft', description: 'Application is in draft state', color: '#gray' },
      { name: 'Submitted', description: 'Application has been submitted', color: '#blue' },
      { name: 'Under Review', description: 'Application is under review', color: '#yellow' },
      { name: 'Approved', description: 'Application has been approved', color: '#green' },
      { name: 'Rejected', description: 'Application has been rejected', color: '#red' }
    ];

    const statusMap = {};
    
    for (const statusData of defaultStatuses) {
      let status = await Status.findOne({ name: statusData.name });
      if (!status) {
        status = await Status.create(statusData);
        console.log(`Created status: ${status.name}`);
      }
      statusMap[statusData.name.toLowerCase().replace(' ', '_')] = status._id;
    }

    // Update applications with string status to ObjectId status
    const applications = await Application.find({});
    
    for (const app of applications) {
      if (typeof app.status === 'string') {
        const statusId = statusMap[app.status] || statusMap['draft'];
        await Application.findByIdAndUpdate(app._id, { status: statusId });
        console.log(`Updated application ${app.applicationNumber} status from ${app.status} to ObjectId`);
      }
    }

    // Update status history with string status to ObjectId status
    const statusHistories = await ApplicationStatusHistory.find({});
    
    for (const history of statusHistories) {
      if (typeof history.status === 'string') {
        const statusId = statusMap[history.status] || statusMap['draft'];
        await ApplicationStatusHistory.findByIdAndUpdate(history._id, { status: statusId });
        console.log(`Updated status history ${history._id} status from ${history.status} to ObjectId`);
      }
    }

    console.log('Application status migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

module.exports = updateApplicationStatus;

// Run migration if called directly
if (require.main === module) {
  const dbConfig = require('../config/db');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oneworldvisa')
    .then(() => {
      console.log('Connected to MongoDB');
      return updateApplicationStatus();
    })
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}