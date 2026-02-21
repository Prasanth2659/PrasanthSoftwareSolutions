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
  
  // Bonus: Payments
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid',
  },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentHistory: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      method: { type: String, trim: true },
      notes: { type: String, trim: true }
    }
  ],

  // Bonus: File Uploads
  files: [
    {
      filename: { type: String, required: true },
      url: { type: String, required: true },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
