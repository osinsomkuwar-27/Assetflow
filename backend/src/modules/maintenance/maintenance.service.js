const { prisma } = require('../../config/db');
const { updateAssetStatus } = require('../../shared/assetStatus.service');

// ─── Valid workflow transitions ──────────────────────────────────

const ALLOWED_TRANSITIONS = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['TechnicianAssigned'],
  TechnicianAssigned: ['InProgress'],
  InProgress: ['Resolved'],
  // Rejected and Resolved are terminal states
};

function assertTransition(current, next) {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    const err = new Error(`Invalid maintenance status transition: ${current} → ${next}`);
    err.statusCode = 400;
    throw err;
  }
}

// ─── Service Functions ──────────────────────────────────────────

/**
 * Create a maintenance request.
 * PRD: Only the current holder or an authorized role can raise a request.
 */
async function createRequest({ assetId, raisedById, issueDescription, priority, photoUrl }) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }

  const requester = await prisma.employee.findUnique({ where: { id: raisedById } });
  if (!requester) {
    const err = new Error('Requester not found');
    err.statusCode = 404;
    throw err;
  }

  const isHolder =
    asset.currentHolderId && asset.currentHolderId === raisedById;
  const isPrivileged = ['Admin', 'AssetManager'].includes(requester.role);

  if (!isHolder && !isPrivileged) {
    const err = new Error('Only the current asset holder or an Admin/Asset Manager can raise a maintenance request');
    err.statusCode = 403;
    throw err;
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId,
      raisedById,
      issueDescription,
      priority: priority || 'Medium',
      photoUrl: photoUrl || null,
    },
  });

  // Notify all Asset Managers
  const managers = await prisma.employee.findMany({
    where: { role: { in: ['Admin', 'AssetManager'] }, status: 'Active' },
  });
  if (managers.length > 0) {
    await prisma.notification.createMany({
      data: managers.map((mgr) => ({
        recipientId: mgr.id,
        type: 'MaintenanceApproved',
        message: `New maintenance request for asset ${asset.assetTag}: ${issueDescription}`,
        relatedEntity: 'MaintenanceRequest',
        relatedId: request.id,
      })),
    });
  }

  return request;
}

/**
 * Approve a pending maintenance request.
 * PRD: Asset status auto-updates to UnderMaintenance only upon Approval.
 */
async function approveRequest(requestId, approverId) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }

  assertTransition(request.status, 'Approved');

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status: 'Approved', approvedById: approverId },
  });

  await updateAssetStatus(
    request.assetId,
    'UnderMaintenance',
    `Maintenance approved (request ${requestId})`,
    approverId
  );

  await prisma.notification.create({
    data: {
      recipientId: request.raisedById,
      type: 'MaintenanceApproved',
      message: 'Your maintenance request has been approved. The asset is now under maintenance.',
      relatedEntity: 'MaintenanceRequest',
      relatedId: request.id,
    },
  });

  return updated;
}

/**
 * Reject a pending maintenance request. No asset status change.
 */
async function rejectRequest(requestId, approverId, reason) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }

  assertTransition(request.status, 'Rejected');

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: 'Rejected',
      approvedById: approverId,
      resolutionNotes: reason || null,
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: request.raisedById,
      type: 'MaintenanceRejected',
      message: `Your maintenance request was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      relatedEntity: 'MaintenanceRequest',
      relatedId: request.id,
    },
  });

  return updated;
}

/**
 * Assign a technician to an approved request.
 */
async function assignTechnician(requestId, technicianName) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }

  assertTransition(request.status, 'TechnicianAssigned');

  return prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status: 'TechnicianAssigned', technician: technicianName },
  });
}

/**
 * Mark an assigned request as in-progress.
 */
async function startWork(requestId) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }

  assertTransition(request.status, 'InProgress');

  return prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status: 'InProgress' },
  });
}

/**
 * Resolve a maintenance request.
 * PRD: Asset status reverts to Available upon Resolved.
 */
async function resolveRequest(requestId, resolutionNotes, actorId) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }

  assertTransition(request.status, 'Resolved');

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: 'Resolved',
      resolutionNotes: resolutionNotes || null,
      resolvedAt: new Date(),
    },
  });

  await updateAssetStatus(
    request.assetId,
    'Available',
    `Maintenance resolved (request ${requestId})`,
    actorId
  );

  await prisma.notification.create({
    data: {
      recipientId: request.raisedById,
      type: 'MaintenanceApproved',
      message: `Your maintenance request has been resolved.${resolutionNotes ? ` Notes: ${resolutionNotes}` : ''}`,
      relatedEntity: 'MaintenanceRequest',
      relatedId: request.id,
    },
  });

  return updated;
}

/**
 * List maintenance requests with optional filters.
 */
async function listRequests(filters = {}) {
  const where = {};
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.raisedById) where.raisedById = filters.raisedById;

  return prisma.maintenanceRequest.findMany({
    where,
    include: {
      asset: { select: { id: true, assetTag: true, name: true, status: true } },
      raisedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single maintenance request by ID.
 */
async function getRequestById(id) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, assetTag: true, name: true, status: true, categoryId: true, departmentId: true } },
      raisedBy: { select: { id: true, name: true, email: true, role: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!request) {
    const err = new Error('Maintenance request not found');
    err.statusCode = 404;
    throw err;
  }
  return request;
}

/**
 * Get maintenance history for a specific asset.
 */
async function getMaintenanceHistory(assetId) {
  return prisma.maintenanceRequest.findMany({
    where: { assetId },
    include: {
      raisedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  createRequest,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
  listRequests,
  getRequestById,
  getMaintenanceHistory,
};
