const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true }, // must have isBookable=true
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// helpful index for overlap queries
bookingSchema.index({ asset: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
