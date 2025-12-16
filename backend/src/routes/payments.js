const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get all payments (admin only)
router.get('/', auth, role(['admin']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      paymentMethod,
      amountFrom,
      amountTo,
      dateFrom,
      dateTo,
      paidFrom,
      paidTo,
      customerEmail,
      customerName,
      transactionId,
      search
    } = req.query;

    // Build match conditions
    const matchConditions = { deletedAt: null };

    // Status filter
    if (status) {
      matchConditions.status = status;
    }

    // Payment method filter
    if (paymentMethod) {
      matchConditions.paymentMethod = paymentMethod;
    }

    // Amount range filter
    if (amountFrom || amountTo) {
      matchConditions.amount = {};
      if (amountFrom) {
        matchConditions.amount.$gte = parseFloat(amountFrom);
      }
      if (amountTo) {
        matchConditions.amount.$lte = parseFloat(amountTo);
      }
    }

    // Date range filters
    if (dateFrom || dateTo) {
      matchConditions.createdAt = {};
      if (dateFrom) {
        matchConditions.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = endDate;
      }
    }

    // Paid date range filters
    if (paidFrom || paidTo) {
      matchConditions.paidAt = {};
      if (paidFrom) {
        matchConditions.paidAt.$gte = new Date(paidFrom);
      }
      if (paidTo) {
        const endDate = new Date(paidTo);
        endDate.setHours(23, 59, 59, 999);
        matchConditions.paidAt.$lte = endDate;
      }
    }

    // Transaction ID filter
    if (transactionId) {
      matchConditions.transactionId = { $regex: transactionId, $options: 'i' };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'application'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$application',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add customer filters after lookup
    const additionalMatch = {};
    
    if (customerEmail) {
      additionalMatch['user.email'] = { $regex: customerEmail, $options: 'i' };
    }
    
    if (customerName) {
      additionalMatch['user.name'] = { $regex: customerName, $options: 'i' };
    }

    // Search across multiple fields
    if (search) {
      additionalMatch.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'application.applicationNumber': { $regex: search, $options: 'i' } }
      ];
    }

    if (Object.keys(additionalMatch).length > 0) {
      pipeline.push({ $match: additionalMatch });
    }

    // Add sorting
    pipeline.push({ $sort: { createdAt: -1 } });

    // Get total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Payment.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute aggregation
    const payments = await Payment.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Get single payment details (admin only)
router.get('/:id', auth, role(['admin']), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('application', 'applicationNumber status')
      .lean();

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Error fetching payment details', error: error.message });
  }
});

module.exports = router;