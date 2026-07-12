const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    holderType: { type: String, enum: ['Employee', 'Department'], required: true },
    holderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    expectedReturnDate: { type: Date, default: null },
    actualReturnDate: { type: Date, default: null },
    conditionAtCheckIn: { type: String, default: null },
    checkInNotes: { type: String, default: null },
    status: { type: String, enum: ['Active', 'Returned'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Allocation', allocationSchema);
