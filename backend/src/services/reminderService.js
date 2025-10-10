const cron = require('node-cron');
const EmbassyReminder = require('../models/EmbassyReminder');
const { sendEmail } = require('./emailService');

// Process embassy visit reminders every minute
const startReminderService = () => {
  console.log('🔔 Starting embassy reminder service...');
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find reminders that should be sent
      const reminders = await EmbassyReminder.find({
        scheduledFor: { $lte: now },
        sent: false
      }).limit(50);
      
      for (const reminder of reminders) {
        try {
          const timeLabels = {
            '7_days': '7 days',
            '3_days': '3 days', 
            '2_days': '2 days',
            '1_day': '1 day',
            '12_hours': '12 hours',
            '6_hours': '6 hours',
            '2_hours': '2 hours',
            '1_hour': '1 hour',
            'on_time': 'now'
          };
          
          await sendEmail(reminder.userEmail, 'embassyVisitReminder', {
            userName: reminder.userName,
            applicationId: reminder.applicationNumber,
            visitDateTime: reminder.visitDateTime,
            timeUntil: timeLabels[reminder.reminderType]
          });
          
          // Mark as sent
          reminder.sent = true;
          reminder.sentAt = new Date();
          await reminder.save();
          
          console.log(`📧 Embassy reminder sent: ${reminder.reminderType} for ${reminder.applicationNumber}`);
        } catch (error) {
          console.error(`Error sending reminder for ${reminder.applicationNumber}:`, error);
        }
      }
      
      // Clean up old reminders (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await EmbassyReminder.deleteMany({
        createdAt: { $lt: thirtyDaysAgo }
      });
      
    } catch (error) {
      console.error('Error processing embassy reminders:', error);
    }
  });
};

module.exports = { startReminderService };