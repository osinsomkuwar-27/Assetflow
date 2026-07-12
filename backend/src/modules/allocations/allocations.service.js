const Asset = require('../../models/Asset');
const Allocation = require('../../models/Allocation');
const TransferRequest = require('../../models/TransferRequest');
const Employee = require('../../models/Employee');
const { updateAssetStatus } = require('../../shared/assetStatus.service');

async function allocateAsset({ assetId, holderType, holderId, expectedReturnDate, actorId }) {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }

  if (asset.status === 'Allocated') {
    // CONFLICT: surface current holder info so the client can offer a Transfer Request
    const activeAllocation = await Allocation.findOne({ asset: assetId, status: 'Active' }).populate('holderId');
    const err = new Error('Asset is already allocated');
    err.statusCode = 409;
    err.conflict = {
      currentHolderType: activeAllocation?.holderType,
      currentHolderId: activeAllocation?.holderId,
      allocationId: activeAllocation?._id,
    };
    throw err;
  }

  if (!['Available', 'Reserved'].includes(asset.status)) {
    const err = new Error(`Asset is not allocatable in its current status: ${asset.status}`);
    err.statusCode = 400;
    throw err;
  }

  const allocation = await Allocation.create({
    asset: assetId,
    holderType,
    holderId,
    allocatedBy: actorId,
    expectedReturnDate: expectedReturnDate || null,
  });

  await updateAssetStatus(assetId, 'Allocated', `Allocated to ${holderType} ${holderId}`, actorId, {
    holderType,
    holderId,
  });

  return allocation;
}

async function requestTransfer({ assetId, requestedHolderType, requestedHolderId, requestedBy, notes }) {
  const activeAllocation = await Allocation.findOne({ asset: assetId, status: 'Active' });
  if (!activeAllocation) {
    const err = new Error('No active allocation to transfer for this asset');
    err.statusCode = 400;
    throw err;
  }

  const transfer = await TransferRequest.create({
    asset: assetId,
    fromAllocation: activeAllocation._id,
    requestedBy,
    requestedHolderType,
    requestedHolderId,
    notes: notes || null,
  });

  return transfer;
}

async function approveTransfer({ transferId, approverId }) {
  const transfer = await TransferRequest.findById(transferId);
  if (!transfer) {
    const err = new Error('Transfer request not found');
    err.statusCode = 404;
    throw err;
  }
  if (transfer.status !== 'Requested') {
    const err = new Error(`Transfer already ${transfer.status}`);
    err.statusCode = 400;
    throw err;
  }

  // close old allocation
  await Allocation.findByIdAndUpdate(transfer.fromAllocation, {
    status: 'Returned',
    actualReturnDate: new Date(),
  });

  // create new allocation (history preserved via the old Allocation doc)
  const newAllocation = await Allocation.create({
    asset: transfer.asset,
    holderType: transfer.requestedHolderType,
    holderId: transfer.requestedHolderId,
    allocatedBy: approverId,
  });

  await updateAssetStatus(
    transfer.asset,
    'Allocated',
    `Transferred to ${transfer.requestedHolderType} ${transfer.requestedHolderId}`,
    approverId,
    { holderType: transfer.requestedHolderType, holderId: transfer.requestedHolderId }
  );

  transfer.status = 'Reallocated';
  transfer.approvedBy = approverId;
  await transfer.save();

  return { transfer, newAllocation };
}

async function returnAsset({ allocationId, condition, notes, actorId }) {
  const allocation = await Allocation.findById(allocationId);
  if (!allocation || allocation.status !== 'Active') {
    const err = new Error('Active allocation not found');
    err.statusCode = 404;
    throw err;
  }

  allocation.status = 'Returned';
  allocation.actualReturnDate = new Date();
  allocation.conditionAtCheckIn = condition || null;
  allocation.checkInNotes = notes || null;
  await allocation.save();

  await updateAssetStatus(allocation.asset, 'Available', 'Returned by holder', actorId);

  return allocation;
}

async function getAssetHistory(assetId) {
  const allocations = await Allocation.find({ asset: assetId }).sort({ createdAt: -1 });
  return allocations;
}

module.exports = { allocateAsset, requestTransfer, approveTransfer, returnAsset, getAssetHistory };
