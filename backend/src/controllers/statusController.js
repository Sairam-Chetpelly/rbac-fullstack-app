const User = require('../models/User');
const Status = require('../models/Status');

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const statusExists = await Status.findOne({ name: status, isActive: true });
    if (!statusExists) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatuses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      isActive,
      name,
      description,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build match conditions
    const matchConditions = { deletedAt: null };

    // Category filter
    if (category) {
      matchConditions.category = category;
    }

    // Active status filter
    if (isActive !== undefined) {
      matchConditions.isActive = isActive === 'true';
    } else {
      // Default to show all statuses (active and inactive) for admin management
      // Remove the default isActive: true filter
    }

    // Name filter
    if (name) {
      matchConditions.name = { $regex: name, $options: 'i' };
    }

    // Description filter
    if (description) {
      matchConditions.description = { $regex: description, $options: 'i' };
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

    // Search across multiple fields
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Status.countDocuments(matchConditions);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Fetch statuses with pagination
    const statuses = await Status.find(matchConditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      data: statuses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ message: error.message });
  }
};

const createStatus = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const status = new Status({ name, description, color });
    await status.save();
    res.status(201).json({ message: 'Status created successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const status = await Status.findByIdAndUpdate(id, updates, { new: true });
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id);
    
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserStatus, getStatuses, getStatusById, createStatus, updateStatus, deleteStatus };