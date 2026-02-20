const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  client:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status:  { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
