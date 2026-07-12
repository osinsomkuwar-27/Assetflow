const { prisma } = require('../../config/db');
const { updateAssetStatus } = require('../../shared/assetStatus.service');

/**
 * Create an audit cycle and auto-generate AuditItems for all in-scope assets.
 */
async function createCycle({ name, scopeDepartment, scopeLocation, startDate, endDate, auditorIds, createdById }) {
  if (new Date(startDate) >= new Date(endDate)) {
    const err = new Error('startDate must be before endDate');
    err.statusCode = 400;
    throw err;
  }

  const cycle = await prisma.auditCycle.create({
    data: {
      name,
      scopeDepartment: scopeDepartment || null,
      scopeLocation: scopeLocation || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      auditorIds: auditorIds || [],
      createdById,
    },
  });

  // Find all assets in scope (exclude disposed)
  const assetWhere = { status: { not: 'Disposed' } };
  if (scopeDepartment) {
    assetWhere.departmentId = scopeDepartment;
  }
  if (scopeLocation) {
    assetWhere.location = { contains: scopeLocation, mode: 'insensitive' };
  }

  const assets = await prisma.asset.findMany({ where: assetWhere, select: { id: true } });

  // Create an AuditItem for each in-scope asset
  if (assets.length > 0) {
    await prisma.auditItem.createMany({
      data: assets.map((a) => ({
        auditCycleId: cycle.id,
        assetId: a.id,
      })),
    });
  }

  // Notify assigned auditors
  if (auditorIds && auditorIds.length > 0) {
    await prisma.notification.createMany({
      data: auditorIds.map((auditorId) => ({
        recipientId: auditorId,
        type: 'AuditDiscrepancyFlagged',
        message: `You have been assigned as an auditor for cycle "${name}".`,
        relatedEntity: 'AuditCycle',
        relatedId: cycle.id,
      })),
    });
  }

  return { cycle, assetsInScope: assets.length };
}

/**
 * Get a single audit cycle with its items.
 */
async function getCycle(cycleId) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!cycle) {
    const err = new Error('Audit cycle not found');
    err.statusCode = 404;
    throw err;
  }

  // Fetch auditor details
  let auditors = [];
  if (cycle.auditorIds.length > 0) {
    auditors = await prisma.employee.findMany({
      where: { id: { in: cycle.auditorIds } },
      select: { id: true, name: true, email: true },
    });
  }

  const items = await prisma.auditItem.findMany({
    where: { auditCycleId: cycleId },
    include: {
      asset: { select: { id: true, assetTag: true, name: true, status: true, location: true, departmentId: true } },
      verifiedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return { cycle: { ...cycle, auditors }, items };
}

/**
 * List audit cycles with optional filters.
 */
async function listCycles(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;

  const cycles = await prisma.auditCycle.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return cycles;
}

/**
 * Verify a single audit item. Only assigned auditors or Admin/AssetManager can verify.
 */
async function verifyItem(itemId, result, verifiedById, notes) {
  const item = await prisma.auditItem.findUnique({
    where: { id: itemId },
    include: { auditCycle: true },
  });

  if (!item) {
    const err = new Error('Audit item not found');
    err.statusCode = 404;
    throw err;
  }

  if (item.auditCycle.status === 'Closed') {
    const err = new Error('Cannot modify items in a closed audit cycle');
    err.statusCode = 400;
    throw err;
  }

  // Check permission
  const isAuditor = item.auditCycle.auditorIds.includes(verifiedById);
  const verifier = await prisma.employee.findUnique({ where: { id: verifiedById } });
  const isPrivileged = verifier && ['Admin', 'AssetManager'].includes(verifier.role);

  if (!isAuditor && !isPrivileged) {
    const err = new Error('Only assigned auditors or Admin/AssetManager can verify audit items');
    err.statusCode = 403;
    throw err;
  }

  const updated = await prisma.auditItem.update({
    where: { id: itemId },
    data: {
      result,
      verifiedById,
      notes: notes || null,
    },
  });

  return updated;
}

/**
 * Get discrepancy report for a cycle — all items not Verified.
 */
async function getDiscrepancyReport(cycleId) {
  const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
  if (!cycle) {
    const err = new Error('Audit cycle not found');
    err.statusCode = 404;
    throw err;
  }

  const discrepancies = await prisma.auditItem.findMany({
    where: {
      auditCycleId: cycleId,
      result: { in: ['Missing', 'Damaged'] },
    },
    include: {
      asset: { select: { id: true, assetTag: true, name: true, status: true, location: true, departmentId: true } },
      verifiedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    cycleName: cycle.name,
    totalDiscrepancies: discrepancies.length,
    missing: discrepancies.filter((d) => d.result === 'Missing').length,
    damaged: discrepancies.filter((d) => d.result === 'Damaged').length,
    items: discrepancies,
  };
}

/**
 * Close an audit cycle.
 * PRD: Cannot close until all items verified. Missing → Lost.
 */
async function closeCycle(cycleId, closedById) {
  const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
  if (!cycle) {
    const err = new Error('Audit cycle not found');
    err.statusCode = 404;
    throw err;
  }

  if (cycle.status === 'Closed') {
    const err = new Error('Audit cycle is already closed');
    err.statusCode = 400;
    throw err;
  }

  // Check all items are verified
  const pendingCount = await prisma.auditItem.count({
    where: { auditCycleId: cycleId, result: 'Pending' },
  });

  if (pendingCount > 0) {
    const err = new Error(`Cannot close cycle: ${pendingCount} asset(s) still pending verification`);
    err.statusCode = 400;
    throw err;
  }

  // Mark missing assets as Lost
  const missingItems = await prisma.auditItem.findMany({
    where: { auditCycleId: cycleId, result: 'Missing' },
  });

  let assetsMarkedLost = 0;
  for (const item of missingItems) {
    try {
      await updateAssetStatus(
        item.assetId,
        'Lost',
        `Confirmed missing in audit cycle "${cycle.name}"`,
        closedById
      );
      assetsMarkedLost++;
    } catch (transitionErr) {
      console.warn(`[Audit] Could not mark asset ${item.assetId} as Lost: ${transitionErr.message}`);
    }
  }

  // Lock the cycle
  const updatedCycle = await prisma.auditCycle.update({
    where: { id: cycleId },
    data: { status: 'Closed' },
  });

  // Notify auditors
  if (cycle.auditorIds.length > 0) {
    await prisma.notification.createMany({
      data: cycle.auditorIds.map((auditorId) => ({
        recipientId: auditorId,
        type: 'AuditDiscrepancyFlagged',
        message: `Audit cycle "${cycle.name}" has been closed.${assetsMarkedLost > 0 ? ` ${assetsMarkedLost} asset(s) marked as Lost.` : ''}`,
        relatedEntity: 'AuditCycle',
        relatedId: cycle.id,
      })),
    });
  }

  // Notify managers if discrepancies found
  if (assetsMarkedLost > 0) {
    const managers = await prisma.employee.findMany({
      where: { role: { in: ['Admin', 'AssetManager'] }, status: 'Active' },
    });
    await prisma.notification.createMany({
      data: managers.map((mgr) => ({
        recipientId: mgr.id,
        type: 'AuditDiscrepancyFlagged',
        message: `Audit cycle "${cycle.name}" closed with ${assetsMarkedLost} missing asset(s).`,
        relatedEntity: 'AuditCycle',
        relatedId: cycle.id,
      })),
    });
  }

  return { cycle: updatedCycle, assetsMarkedLost };
}

module.exports = {
  createCycle,
  getCycle,
  listCycles,
  verifyItem,
  getDiscrepancyReport,
  closeCycle,
};
