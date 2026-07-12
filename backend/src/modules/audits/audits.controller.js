const svc = require('./audits.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function createCycle(req, res, next) {
  try {
    const { name, scopeDepartment, scopeLocation, startDate, endDate, auditorIds } = req.body;
    if (!name || !startDate || !endDate) {
      return fail(res, 'name, startDate, and endDate are required', 400);
    }
    if (!scopeDepartment && !scopeLocation) {
      return fail(res, 'Either scopeDepartment or scopeLocation is required', 400);
    }
    const result = await svc.createCycle({
      name, scopeDepartment, scopeLocation, startDate, endDate, auditorIds, createdById: req.user.id,
    });
    return ok(res, result, 'Audit cycle created', 201);
  } catch (err) {
    next(err);
  }
}

async function listCycles(req, res, next) {
  try {
    const { status } = req.query;
    const cycles = await svc.listCycles({ status });
    return ok(res, cycles, 'Audit cycles fetched');
  } catch (err) {
    next(err);
  }
}

async function getCycle(req, res, next) {
  try {
    const result = await svc.getCycle(req.params.id);
    return ok(res, result, 'Audit cycle fetched');
  } catch (err) {
    next(err);
  }
}

async function verifyItem(req, res, next) {
  try {
    const { itemId, result, notes } = req.body;
    if (!itemId || !result) {
      return fail(res, 'itemId and result are required', 400);
    }
    if (!['Verified', 'Missing', 'Damaged'].includes(result)) {
      return fail(res, 'result must be one of: Verified, Missing, Damaged', 400);
    }
    const item = await svc.verifyItem(itemId, result, req.user.id, notes);
    return ok(res, item, 'Audit item verified');
  } catch (err) {
    next(err);
  }
}

async function getDiscrepancies(req, res, next) {
  try {
    const report = await svc.getDiscrepancyReport(req.params.id);
    return ok(res, report, 'Discrepancy report generated');
  } catch (err) {
    next(err);
  }
}

async function closeCycle(req, res, next) {
  try {
    const result = await svc.closeCycle(req.params.id, req.user.id);
    return ok(res, result, 'Audit cycle closed');
  } catch (err) {
    next(err);
  }
}

module.exports = { createCycle, listCycles, getCycle, verifyItem, getDiscrepancies, closeCycle };
