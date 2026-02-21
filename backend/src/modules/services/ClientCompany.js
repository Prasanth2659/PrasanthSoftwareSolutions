const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  industry:     { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ClientCompany', companySchema);
