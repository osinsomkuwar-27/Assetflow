const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    role: {
      type: String,
      enum: ['Employee', 'DepartmentHead', 'AssetManager', 'Admin'],
      default: 'Employee',
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
