const { prisma } = require('../../config/db');
const { updateAssetStatus } = require('../../shared/assetStatus.service');

async function allocateAsset({ assetId, holderType, holderId, expectedReturnDate, actorId }) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }

  if (asset.status === 'Allocated') {
    const activeAllocation = await prisma.allocation.findFirst({
      where: { assetId, status: 'Active' },
    });
    const err = new Error('Asset is already allocated');
    err.statusCode = 409;
    err.conflict = {
      currentHolderType: activeAllocation?.holderType,
      currentHolderId: activeAllocation?.holderId,
      allocationId: activeAllocation?.id,
    };
    throw err;
  }

  if (!['Available', 'Reserved'].includes(asset.status)) {
    const err = new Error(`Asset is not allocatable in its current status: ${asset.status}`);
    err.statusCode = 400;
    throw err;
  }

  const allocation = await prisma.allocation.create({
    data: {
      assetId,
      holderType,
      holderId,
      allocatedById: actorId,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
    },
  });

  await updateAssetStatus(assetId, 'Allocated', `Allocated to ${holderType} ${holderId}`, actorId, {
    holderType,
    holderId,
  });

  return allocation;
}

async function requestTransfer({ assetId, requestedHolderType, requestedHolderId, requestedBy, notes }) {
  const activeAllocation = await prisma.allocation.findFirst({
    where: { assetId, status: 'Active' },
  });
  if (!activeAllocation) {
    const err = new Error('No active allocation to transfer for this asset');
    err.statusCode = 400;
    throw err;
  }

  const transfer = await prisma.transferRequest.create({
    data: {
      assetId,
      fromAllocationId: activeAllocation.id,
      requestedById: requestedBy,
      requestedHolderType,
      requestedHolderId,
      notes: notes || null,
    },
  });

  return transfer;
}

async function approveTransfer({ transferId, approverId }) {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: transferId } });
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

  await prisma.allocation.update({
    where: { id: transfer.fromAllocationId },
    data: { status: 'Returned', actualReturnDate: new Date() },
  });

  const newAllocation = await prisma.allocation.create({
    data: {
      assetId: transfer.assetId,
      holderType: transfer.requestedHolderType,
      holderId: transfer.requestedHolderId,
      allocatedById: approverId,
    },
  });

  await updateAssetStatus(
    transfer.assetId,
    'Allocated',
    `Transferred to ${transfer.requestedHolderType} ${transfer.requestedHolderId}`,
    approverId,
    { holderType: transfer.requestedHolderType, holderId: transfer.requestedHolderId }
  );

  const updatedTransfer = await prisma.transferRequest.update({
    where: { id: transferId },
    data: { status: 'Reallocated', approvedById: approverId },
  });

  return { transfer: updatedTransfer, newAllocation };
}

async function returnAsset({ allocationId, condition, notes, actorId }) {
  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
  if (!allocation || allocation.status !== 'Active') {
    const err = new Error('Active allocation not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.allocation.update({
    where: { id: allocationId },
    data: {
      status: 'Returned',
      actualReturnDate: new Date(),
      conditionAtCheckIn: condition || null,
      checkInNotes: notes || null,
    },
  });

  await updateAssetStatus(allocation.assetId, 'Available', 'Returned by holder', actorId);

  return updated;
}

async function getAssetHistory(assetId) {
  return prisma.allocation.findMany({
    where: { assetId },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { allocateAsset, requestTransfer, approveTransfer, returnAsset, getAssetHistory };
