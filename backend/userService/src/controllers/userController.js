const User = require('../models/User');

const authorize = (...roles) => (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// GET /api/users — Admin gets all, else own profile
exports.getUsers = [
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// POST /api/users — Admin creates users
exports.createUser = [
  authorize('admin'),
  async (req, res) => {
    try {
      const { name, email, password, role, company, phone, bio } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      const user = await User.create({ name, email, password, role, company, phone, bio });
      const { password: _, ...safe } = user.toObject();
      res.status(201).json(safe);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id — Admin or self
exports.updateUser = async (req, res) => {
  try {
    const requesterId = req.headers['x-user-id'];
    const requesterRole = req.headers['x-user-role'];
    if (requesterRole !== 'admin' && requesterId !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' });

    const { password, role, ...rest } = req.body;
    // Only admin can change role
    if (requesterRole === 'admin' && role) rest.role = role;
    if (password) {
      const bcrypt = require('bcryptjs');
      rest.password = await bcrypt.hash(password, 12);
    }
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id — Admin only
exports.deleteUser = [
  authorize('admin'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];
