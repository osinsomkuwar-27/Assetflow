const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    fromAllocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    requestedHolderType: { type: String, enum: ['Employee', 'Department'], required: true },
    requestedHolderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Reallocated'], default: 'Requested' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
