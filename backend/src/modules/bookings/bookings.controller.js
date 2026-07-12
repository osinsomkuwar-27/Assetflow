const svc = require('./bookings.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function create(req, res, next) {
  try {
    const { assetId, department, startTime, endTime } = req.body;
    if (!assetId || !startTime || !endTime) return fail(res, 'assetId, startTime, endTime are required', 400);

    const booking = await svc.createBooking({ assetId, bookedBy: req.user.id, department, startTime, endTime });
    return ok(res, booking, 'Booking confirmed', 201);
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ success: false, message: err.message, conflict: err.conflict });
    }
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const booking = await svc.cancelBooking(req.params.id);
    return ok(res, booking, 'Booking cancelled');
  } catch (err) {
    next(err);
  }
}

async function listForAsset(req, res, next) {
  try {
    const bookings = await svc.listBookingsForAsset(req.params.assetId);
    return ok(res, bookings, 'Bookings fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { create, cancel, listForAsset };
