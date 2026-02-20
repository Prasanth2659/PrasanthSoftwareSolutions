const ClientCompany = require('../models/ClientCompany');
const role = (req) => req.headers['x-user-role'];
const uid  = (req) => req.headers['x-user-id'];

exports.getAll = async (req, res) => {
  try {
    res.json(await ClientCompany.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const c = await ClientCompany.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Company not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const c = await ClientCompany.create({ ...req.body, createdBy: uid(req) });
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const c = await ClientCompany.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Company not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const c = await ClientCompany.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
