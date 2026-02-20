const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  description:       { type: String, default: '' },
  client:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:            {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'on_hold'],
    default: 'not_started',
  },
  serviceRequest:    { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
