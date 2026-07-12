const mongoose = require('mongoose');

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true }, // auto-generated e.g. AF-0001
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    serialNumber: { type: String, trim: true },
    acquisitionDate: { type: Date },
    acquisitionCost: { type: Number, default: 0 }, // reporting only, not linked to accounting
    condition: { type: String, enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'], default: 'Good' },
    location: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    photoUrl: { type: String, default: null },
    documents: [{ type: String }],
    isBookable: { type: Boolean, default: false }, 
    status: { type: String, enum: ASSET_STATUSES, default: 'Available' },
    currentHolder: {
      holderType: { type: String, enum: ['Employee', 'Department', null], default: null },
      holderId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_STATUSES = ASSET_STATUSES;
