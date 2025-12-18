const Continent = require('../models/Continent');

const getContinents = async (req, res) => {
  try {
    const continents = await Continent.find({ deletedAt: null });
    // Ensure isActive field exists for all continents
    const updatedContinents = continents.map(continent => ({
      ...continent.toObject(),
      isActive: continent.isActive !== undefined ? continent.isActive : true
    }));
    res.json(updatedContinents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createContinent = async (req, res) => {
  try {
    const continent = new Continent(req.body);
    await continent.save();
    res.status(201).json(continent);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateContinent = async (req, res) => {
  try {
    const continent = await Continent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!continent) return res.status(404).json({ message: 'Continent not found' });
    res.json(continent);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteContinent = async (req, res) => {
  try {
    const continent = await Continent.findById(req.params.id);
    if (!continent) return res.status(404).json({ message: 'Continent not found' });
    
    const timestamp = Date.now();
    const updatedContinent = await Continent.findByIdAndUpdate(req.params.id, {
      deletedAt: new Date(),
      slug: `deleted-${timestamp}-${continent.slug}`
    }, { new: true });
    
    res.json({ message: 'Continent deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContinents, createContinent, updateContinent, deleteContinent };