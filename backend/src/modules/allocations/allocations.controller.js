const svc = require('./allocations.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function allocate(req, res, next) {
  try {
    const { assetId, holderType, holderId, expectedReturnDate } = req.body;
    if (!assetId || !holderType || !holderId) return fail(res, 'assetId, holderType, holderId are required', 400);

    const allocation = await svc.allocateAsset({
      assetId, holderType, holderId, expectedReturnDate, actorId: req.user.id,
    });
    return ok(res, allocation, 'Asset allocated', 201);
  } catch (err) {
    if (err.statusCode === 409) {
      // conflict: still return 200-shaped payload with conflict details so FE can show the Transfer Request button
      return res.status(409).json({ success: false, message: err.message, conflict: err.conflict });
    }
    next(err);
  }
}

async function transferRequest(req, res, next) {
  try {
    const { assetId, requestedHolderType, requestedHolderId, notes } = req.body;
    const transfer = await svc.requestTransfer({
      assetId, requestedHolderType, requestedHolderId, requestedBy: req.user.id, notes,
    });
    return ok(res, transfer, 'Transfer requested', 201);
  } catch (err) {
    next(err);
  }
}

async function transferApprove(req, res, next) {
  try {
    const result = await svc.approveTransfer({ transferId: req.params.id, approverId: req.user.id });
    return ok(res, result, 'Transfer approved and re-allocated');
  } catch (err) {
    next(err);
  }
}

async function returnAsset(req, res, next) {
  try {
    const { allocationId, condition, notes } = req.body;
    const allocation = await svc.returnAsset({ allocationId, condition, notes, actorId: req.user.id });
    return ok(res, allocation, 'Asset returned');
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const allocations = await svc.getAssetHistory(req.params.assetId);
    return ok(res, allocations, 'Allocation history fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { allocate, transferRequest, transferApprove, returnAsset, history };
