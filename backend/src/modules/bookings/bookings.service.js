const Asset = require('../../models/Asset');
const Booking = require('../../models/Booking');
const { rangesOverlap } = require('../../shared/utils/overlapCheck');

async function createBooking({ assetId, bookedBy, department, startTime, endTime }) {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }
  if (!asset.isBookable) {
    const err = new Error('Asset is not marked as a bookable resource');
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end) {
    const err = new Error('startTime must be before endTime');
    err.statusCode = 400;
    throw err;
  }

  // fetch existing active bookings for this asset that could possibly overlap
  const existing = await Booking.find({
    asset: assetId,
    status: { $in: ['Upcoming', 'Ongoing'] },
  });

  const conflict = existing.find((b) => rangesOverlap(start, end, b.startTime, b.endTime));
  if (conflict) {
    const err = new Error('This time slot overlaps with an existing booking');
    err.statusCode = 409;
    err.conflict = { bookingId: conflict._id, startTime: conflict.startTime, endTime: conflict.endTime };
    throw err;
  }

  const booking = await Booking.create({
    asset: assetId,
    bookedBy,
    department: department || null,
    startTime: start,
    endTime: end,
  });

  return booking;
}

async function cancelBooking(bookingId) {
  const booking = await Booking.findByIdAndUpdate(bookingId, { status: 'Cancelled' }, { new: true });
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

async function listBookingsForAsset(assetId) {
  return Booking.find({ asset: assetId }).sort({ startTime: 1 });
}

module.exports = { createBooking, cancelBooking, listBookingsForAsset };
