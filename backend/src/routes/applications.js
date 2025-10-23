const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const ApplicationAnswer = require('../models/ApplicationAnswer');
const ApplicationDocument = require('../models/ApplicationDocument');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { sendEmail, sendAdminNotification } = require('../services/emailService');
const { fromIST } = require('../utils/dateUtils');
const { uploads } = require('../middleware/universalUpload');

const router = express.Router();

// Schedule embassy visit reminders
const scheduleEmbassyReminders = async (applicationId, userEmail, userName, applicationNumber, visitDateTime) => {
  const EmbassyReminder = require('../models/EmbassyReminder');
  const visitDate = new Date(visitDateTime);
  const now = new Date();
  
  // Clear existing reminders for this application
  await EmbassyReminder.deleteMany({ application: applicationId });
  
  const reminderTimes = [
    { type: '7_days', days: 7, label: '7 days' },
    { type: '3_days', days: 3, label: '3 days' },
    { type: '2_days', days: 2, label: '2 days' },
    { type: '1_day', days: 1, label: '1 day' },
    { type: '12_hours', hours: 12, label: '12 hours' },
    { type: '6_hours', hours: 6, label: '6 hours' },
    { type: '2_hours', hours: 2, label: '2 hours' },
    { type: '1_hour', hours: 1, label: '1 hour' },
    { type: 'on_time', minutes: 0, label: 'now' }
  ];
  
  for (const reminder of reminderTimes) {
    let reminderTime;
    if (reminder.days) {
      reminderTime = new Date(visitDate.getTime() - (reminder.days * 24 * 60 * 60 * 1000));
    } else if (reminder.hours) {
      reminderTime = new Date(visitDate.getTime() - (reminder.hours * 60 * 60 * 1000));
    } else {
      reminderTime = new Date(visitDate.getTime());
    }
    
    if (reminderTime > now) {
      await EmbassyReminder.create({
        application: applicationId,
        userEmail,
        userName,
        applicationNumber,
        visitDateTime,
        reminderType: reminder.type,
        scheduledFor: reminderTime
      });
    }
  }
};

// Get all available statuses
router.get('/statuses', auth, async (req, res) => {
  try {
    const Status = require('../models/Status');
    const statuses = await Status.find({ isActive: true }).sort({ name: 1 });
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ message: 'Error fetching statuses', error: error.message });
  }
});

// Get employees for assignment (admin/manager only)
router.get('/employees', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const User = require('../models/User');
    const Role = require('../models/Role');
     const employee = await Role.findOne({ name: 'employee' });
    console.log('Draft status:', employee);
    if (!employee) {
      return res.status(500).json({ message: 'employee role not found' });
    }
    
    const employees = await User.find({ role: employee }).select('name email');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Assign application to employee
router.put('/:id/assign', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id, 
      { assignedTo: employeeId },
      { new: true }
    )
    .populate('user', 'name email')
    .populate({
      path: 'countryVisaType',
      populate: {
        path: 'country',
        select: 'name placeImage'
      }
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Get employee details
    const User = require('../models/User');
    const employee = await User.findById(employeeId);
    
    if (employee) {
      // Send assignment email to employee
      sendEmail(employee.email, 'applicationAssigned', {
        employeeName: employee.name,
        applicationNumber: application.applicationNumber,
        customerName: application.user.name,
        customerEmail: application.user.email,
        visaType: application.countryVisaType?.country?.name || 'Visa Application'
      });
    }
    
    res.json({ message: 'Application assigned successfully' });
  } catch (error) {
    console.error('Error assigning application:', error);
    res.status(500).json({ message: 'Error assigning application', error: error.message });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/applications';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

// Get payments for assigned applications (employee)
router.get('/assigned/payments', auth, role(['employee']), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    
    // Get applications assigned to this employee
    const assignedApps = await Application.find({ 
      assignedTo: req.user._id,
      deletedAt: null 
    }).select('_id');
    
    const appIds = assignedApps.map(app => app._id);
    
    const payments = await Payment.find({ 
      application: { $in: appIds },
      deletedAt: null 
    })
      .populate({
        path: 'application',
        populate: {
          path: 'countryVisaType',
          populate: {
            path: 'country',
            select: 'name placeImage'
          }
        }
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching assigned payments:', error);
    res.status(500).json({ message: 'Error fetching assigned payments', error: error.message });
  }
});

// Get applications assigned to employee
router.get('/assigned', auth, role(['employee']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { assignedTo: req.user._id, deletedAt: null };
    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('user', 'name email')
      .populate('status', 'name color')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country',
          select: 'name placeImage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assigned applications:', error);
    res.status(500).json({ message: 'Error fetching assigned applications', error: error.message });
  }
});

// Get all applications (admin only)
router.get('/', auth, role(['admin', 'manager']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments({ deletedAt: null });
    const applications = await Application.find({ deletedAt: null })
      .populate('user', 'name email')
      .populate('status', 'name color')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'countryVisaType',
        populate: {
          path: 'country',
          select: 'name placeImage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get single application details
router.get('/:id', auth, role(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const Applicant = require('../models/Applicant');
    
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('status', 'name color')
      .populate({
        path: 'countryVisaType',
        populate: [
          { path: 'country', select: 'name placeImage' },
          { path: 'visaType', select: 'name' }
        ]
      })
      .lean();

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get applicants
    const applicants = await Applicant.find({ application: req.params.id, deletedAt: null })
      .sort({ applicantIndex: 1 })
      .lean();

    // Get application answers
    const answers = await ApplicationAnswer.find({ application: req.params.id })
      .populate('field', 'name label type')
      .lean();

    // Get application documents
    const documents = await ApplicationDocument.find({ application: req.params.id })
      .lean();

    // Get status history
    const statusHistory = await ApplicationStatusHistory.find({ application: req.params.id })
      .populate('changedBy', 'name')
      .populate('status', 'name color')
      .sort({ changedAt: -1 })
      .lean();

    // Get payment information
    const payment = await Payment.findOne({ application: req.params.id })
      .lean();

    res.json({
      application,
      applicants,
      answers,
      documents,
      statusHistory,
      payment
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ message: 'Error fetching application details', error: error.message });
  }
});

// Update application data
router.put('/:id', auth, role(['admin', 'employee']), async (req, res) => {
  try {
    const { answers } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application answers
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        const updateData = {};
        if (answer.answerText !== undefined) {
          updateData.answerText = answer.answerText;
        }
        if (answer.answerFile !== undefined) {
          updateData.answerFile = answer.answerFile;
        }
        
        await ApplicationAnswer.findByIdAndUpdate(
          answer._id,
          updateData,
          { new: true }
        );
      }
    }

    res.json({ message: 'Application updated successfully' });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});

// Update application status (admin only)
router.put('/:id/status', auth, role(['admin','employee']), async (req, res) => {
  try {
    const { status, remarks, embassyVisitDateTime } = req.body;
    
    const Status = require('../models/Status');
    const statusDoc = await Status.findById(status);
    if (!statusDoc) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('status', 'name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const oldStatus = application.status;
    
    // Update application status and embassy visit date
    application.status = status;
    if (embassyVisitDateTime) {
      application.embassyVisitDateTime = embassyVisitDateTime;
    }
    await application.save();

    // Create status history entry
    await ApplicationStatusHistory.create({
      application: req.params.id,
      status,
      remarks: remarks || '',
      changedBy: req.user._id
    });

    // Send status update emails
    const User = require('../models/User');
    const updatedBy = await User.findById(req.user._id);
    
    // Email to customer
    sendEmail(application.user.email, 'statusUpdate', {
      userName: application.user.name,
      applicationId: application.applicationNumber,
      status: statusDoc.name,
      remarks: remarks
    });
    
    // Email to admin
    sendAdminNotification('adminStatusUpdate', {
      applicationId: application.applicationNumber,
      userName: application.user.name,
      oldStatus: oldStatus?.name || 'Unknown',
      newStatus: statusDoc.name,
      updatedBy: updatedBy.name
    });

    // Send embassy visit notification if date is set
    if (embassyVisitDateTime) {
      sendEmail(application.user.email, 'embassyVisitScheduled', {
        userName: application.user.name,
        applicationId: application.applicationNumber,
        visitDateTime: embassyVisitDateTime
      });
      
      sendAdminNotification('embassyVisitScheduled', {
        userName: application.user.name,
        applicationId: application.applicationNumber,
        visitDateTime: embassyVisitDateTime
      });
      
      // Schedule reminder emails
      scheduleEmbassyReminders(application._id, application.user.email, application.user.name, application.applicationNumber, embassyVisitDateTime);
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Update payment status
router.put('/:id/payment', auth, role(['admin', 'employee']), async (req, res) => {
  try {
    const { status, transactionId, paymentMethod, remarks } = req.body;
    
    const payment = await Payment.findOne({ application: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (remarks) payment.remarks = remarks;
    if (status === 'success') payment.paidAt = new Date();
    
    await payment.save();
    
    // Get application details for email
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email');
    
    if (application && status === 'success') {
      // Send payment confirmation email
      await sendEmail(application.user.email, 'paymentConfirmed', {
        userName: application.user.name,
        applicationNumber: application.applicationNumber,
        amount: payment.amount,
        transactionId: payment.transactionId
      });
    }
    
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Delete application (admin only)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application', error: error.message });
  }
});

module.exports = router;