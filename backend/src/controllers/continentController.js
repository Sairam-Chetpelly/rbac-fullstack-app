const Continent = require('../models/Continent');

const getContinents = async (req, res) => {
  try {
    const continents = await Continent.find().populate('status');
    res.json(continents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createContinent = async (req, res) => {
  try {
    const continent = new Continent(req.body);
    await continent.save();
    await continent.populate('status');
    res.status(201).json(continent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateContinent = async (req, res) => {
  try {
    const continent = await Continent.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('status');
    if (!continent) return res.status(404).json({ message: 'Continent not found' });
    res.json(continent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteContinent = async (req, res) => {
  try {
    const continent = await Continent.findByIdAndDelete(req.params.id);
    if (!continent) return res.status(404).json({ message: 'Continent not found' });
    res.json({ message: 'Continent deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getContinents, createContinent, updateContinent, deleteContinent };