const Role = require('../models/Role');

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = new Role({ name, permissions, description });
    await role.save();
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const role = await Role.findByIdAndUpdate(id, updates, { new: true });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoles, createRole, updateRole, deleteRole };