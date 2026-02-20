const ServiceRequest = require('../models/ServiceRequest');
const role = (req) => req.headers['x-user-role'];
const uid  = (req) => req.headers['x-user-id'];

// GET /api/service-requests
exports.getAll = async (req, res) => {
  try {
    const query = role(req) === 'admin' ? {} : { client: uid(req) };
    const requests = await ServiceRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/service-requests — Client only
exports.create = async (req, res) => {
  try {
    if (role(req) !== 'client') return res.status(403).json({ message: 'Only clients can request services' });
    const sr = await ServiceRequest.create({ ...req.body, client: uid(req), status: 'pending' });
    res.status(201).json(sr);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/service-requests/:id/approve — Admin only
exports.approve = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const sr = await ServiceRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!sr) return res.status(404).json({ message: 'Request not found' });
    res.json(sr);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/service-requests/:id/reject — Admin only
exports.reject = async (req, res) => {
  try {
    if (role(req) !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const sr = await ServiceRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!sr) return res.status(404).json({ message: 'Request not found' });
    res.json(sr);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/service-requests/:id
exports.getById = async (req, res) => {
  try {
    const sr = await ServiceRequest.findById(req.params.id);
    if (!sr) return res.status(404).json({ message: 'Request not found' });
    res.json(sr);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
