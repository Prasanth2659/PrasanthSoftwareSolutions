const Service = require('./Service');
const role = (req) => req.headers['x-user-role'];
const uid  = (req) => req.headers['x-user-id'];

exports.getAll = async (req, res) => {
  try {
    res.json(await Service.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const s = await Service.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Service not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const s = await Service.create({ ...req.body, createdBy: uid(req) });
    res.status(201).json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: 'Service not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const s = await Service.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

