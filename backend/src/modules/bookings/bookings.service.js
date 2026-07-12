const { prisma } = require('../../config/db');
const { rangesOverlap } = require('../../shared/utils/overlapCheck');

async function createBooking({ assetId, bookedBy, department, startTime, endTime }) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
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
  const existing = await prisma.booking.findMany({
    where: { assetId, status: { in: ['Upcoming', 'Ongoing'] } },
  });

  const conflict = existing.find((b) => rangesOverlap(start, end, b.startTime, b.endTime));
  if (conflict) {
    const err = new Error('This time slot overlaps with an existing booking');
    err.statusCode = 409;
    err.conflict = { bookingId: conflict.id, startTime: conflict.startTime, endTime: conflict.endTime };
    throw err;
  }

  const booking = await prisma.booking.create({
    data: {
      assetId,
      bookedById: bookedBy,
      departmentId: department || null,
      startTime: start,
      endTime: end,
    },
  });

  return booking;
}

async function cancelBooking(bookingId) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' },
    });
    return booking;
  } catch (e) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
}

async function listBookingsForAsset(assetId) {
  return prisma.booking.findMany({ where: { assetId }, orderBy: { startTime: 'asc' } });
}

module.exports = { createBooking, cancelBooking, listBookingsForAsset };
