const svc = require('./reports.service');
const { ok } = require('../../shared/utils/responseFormatter');

async function utilization(req, res, next) {
  try {
    const data = await svc.getAssetUtilization();
    return ok(res, data, 'Asset utilization report');
  } catch (err) { next(err); }
}

async function maintenanceFrequency(req, res, next) {
  try {
    const { groupBy } = req.query;
    const data = await svc.getMaintenanceFrequency(groupBy || 'asset');
    return ok(res, data, 'Maintenance frequency report');
  } catch (err) { next(err); }
}

async function departmentSummary(req, res, next) {
  try {
    const data = await svc.getDepartmentAllocationSummary();
    return ok(res, data, 'Department allocation summary');
  } catch (err) { next(err); }
}

async function bookingHeatmap(req, res, next) {
  try {
    const data = await svc.getBookingHeatmap();
    return ok(res, data, 'Booking heatmap');
  } catch (err) { next(err); }
}

async function assetsDueMaintenance(req, res, next) {
  try {
    const { threshold } = req.query;
    const data = await svc.getAssetsDueForMaintenance(parseInt(threshold) || 3);
    return ok(res, data, 'Assets due for maintenance');
  } catch (err) { next(err); }
}

async function assetsNearingRetirement(req, res, next) {
  try {
    const { ageYears } = req.query;
    const data = await svc.getAssetsNearingRetirement(parseInt(ageYears) || 5);
    return ok(res, data, 'Assets nearing retirement');
  } catch (err) { next(err); }
}

async function stats(req, res, next) {
  try {
    const data = await svc.getOverallStats();
    return ok(res, data, 'Overall stats');
  } catch (err) { next(err); }
}

module.exports = { utilization, maintenanceFrequency, departmentSummary, bookingHeatmap, assetsDueMaintenance, assetsNearingRetirement, stats };
