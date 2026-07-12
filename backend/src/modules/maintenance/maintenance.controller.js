const svc = require('./maintenance.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function create(req, res, next) {
  try {
    const { assetId, issueDescription, priority, photoUrl } = req.body;
    if (!assetId || !issueDescription) {
      return fail(res, 'assetId and issueDescription are required', 400);
    }
    const request = await svc.createRequest({
      assetId,
      raisedById: req.user.id,
      issueDescription,
      priority,
      photoUrl,
    });
    return ok(res, request, 'Maintenance request created', 201);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { assetId, status, priority, raisedById } = req.query;
    const requests = await svc.listRequests({ assetId, status, priority, raisedById });
    return ok(res, requests, 'Maintenance requests fetched');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const request = await svc.getRequestById(req.params.id);
    return ok(res, request, 'Maintenance request fetched');
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const request = await svc.approveRequest(req.params.id, req.user.id);
    return ok(res, request, 'Maintenance request approved');
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const { reason } = req.body;
    const request = await svc.rejectRequest(req.params.id, req.user.id, reason);
    return ok(res, request, 'Maintenance request rejected');
  } catch (err) {
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    const { technicianName } = req.body;
    if (!technicianName) return fail(res, 'technicianName is required', 400);
    const request = await svc.assignTechnician(req.params.id, technicianName);
    return ok(res, request, 'Technician assigned');
  } catch (err) {
    next(err);
  }
}

async function start(req, res, next) {
  try {
    const request = await svc.startWork(req.params.id);
    return ok(res, request, 'Maintenance work started');
  } catch (err) {
    next(err);
  }
}

async function resolve(req, res, next) {
  try {
    const { resolutionNotes } = req.body;
    const request = await svc.resolveRequest(req.params.id, resolutionNotes, req.user.id);
    return ok(res, request, 'Maintenance request resolved');
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const requests = await svc.getMaintenanceHistory(req.params.assetId);
    return ok(res, requests, 'Maintenance history fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, approve, reject, assign, start, resolve, history };
