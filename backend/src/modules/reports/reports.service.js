const { prisma } = require('../../config/db');

/**
 * Asset utilization — allocation count per asset, most-used vs idle.
 */
async function getAssetUtilization() {
  const allocations = await prisma.allocation.groupBy({
    by: ['assetId'],
    _count: { assetId: true },
    orderBy: { _count: { assetId: 'desc' } },
  });

  const assetIds = allocations.map((a) => a.assetId);
  const assets = await prisma.asset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, assetTag: true, name: true, status: true },
  });

  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a]));

  const mostUsed = allocations.slice(0, 20).map((a) => ({
    assetId: a.assetId,
    assetTag: assetMap[a.assetId]?.assetTag,
    name: assetMap[a.assetId]?.name,
    status: assetMap[a.assetId]?.status,
    allocationCount: a._count.assetId,
  }));

  // Idle assets — never allocated
  const idle = await prisma.asset.findMany({
    where: { id: { notIn: assetIds }, status: { not: 'Disposed' } },
    select: { id: true, assetTag: true, name: true, status: true },
  });

  return { mostUsed, idle, total: assetIds.length + idle.length };
}

/**
 * Maintenance frequency grouped by asset or category.
 */
async function getMaintenanceFrequency(groupBy = 'asset') {
  if (groupBy === 'category') {
    // Group via asset's category
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: { select: { categoryId: true } } },
    });

    const categoryMap = {};
    for (const r of requests) {
      const catId = r.asset.categoryId;
      if (!categoryMap[catId]) categoryMap[catId] = { total: 0, resolved: 0 };
      categoryMap[catId].total++;
      if (r.status === 'Resolved') categoryMap[catId].resolved++;
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: Object.keys(categoryMap) } },
      select: { id: true, name: true },
    });
    const catNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    return Object.entries(categoryMap)
      .map(([catId, counts]) => ({
        categoryId: catId,
        categoryName: catNameMap[catId] || 'Uncategorized',
        requestCount: counts.total,
        resolvedCount: counts.resolved,
      }))
      .sort((a, b) => b.requestCount - a.requestCount);
  }

  // Default: group by asset
  const result = await prisma.maintenanceRequest.groupBy({
    by: ['assetId'],
    _count: { assetId: true },
    orderBy: { _count: { assetId: 'desc' } },
  });

  const assetIds = result.map((r) => r.assetId);
  const assets = await prisma.asset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, assetTag: true, name: true },
  });
  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a]));

  return result.map((r) => ({
    assetId: r.assetId,
    assetTag: assetMap[r.assetId]?.assetTag,
    name: assetMap[r.assetId]?.name,
    requestCount: r._count.assetId,
  }));
}

/**
 * Department-wise allocation summary.
 */
async function getDepartmentAllocationSummary() {
  const assets = await prisma.asset.findMany({
    where: { departmentId: { not: null } },
    select: { departmentId: true, status: true },
  });

  const deptMap = {};
  for (const a of assets) {
    if (!deptMap[a.departmentId]) {
      deptMap[a.departmentId] = { total: 0, Available: 0, Allocated: 0, UnderMaintenance: 0, Lost: 0, Retired: 0 };
    }
    deptMap[a.departmentId].total++;
    if (deptMap[a.departmentId][a.status] !== undefined) {
      deptMap[a.departmentId][a.status]++;
    }
  }

  const departments = await prisma.department.findMany({
    where: { id: { in: Object.keys(deptMap) } },
    select: { id: true, name: true },
  });
  const deptNameMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  return Object.entries(deptMap)
    .map(([deptId, counts]) => ({
      departmentId: deptId,
      departmentName: deptNameMap[deptId] || 'Unknown',
      ...counts,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Booking heatmap — counts by day-of-week and hour.
 */
async function getBookingHeatmap() {
  const bookings = await prisma.booking.findMany({
    where: { status: { in: ['Upcoming', 'Ongoing', 'Completed'] } },
    select: { startTime: true },
  });

  const heatmap = {};
  for (const b of bookings) {
    const d = new Date(b.startTime);
    const day = d.getDay(); // 0=Sun
    const hour = d.getHours();
    const key = `${day}-${hour}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  }

  return Object.entries(heatmap)
    .map(([key, count]) => {
      const [day, hour] = key.split('-').map(Number);
      return { dayOfWeek: day, hour, count };
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.hour - b.hour);
}

/**
 * Assets with high maintenance frequency.
 */
async function getAssetsDueForMaintenance(threshold = 3) {
  const result = await prisma.maintenanceRequest.groupBy({
    by: ['assetId'],
    _count: { assetId: true },
    _max: { createdAt: true },
    having: { assetId: { _count: { gte: threshold } } },
    orderBy: { _count: { assetId: 'desc' } },
  });

  const assetIds = result.map((r) => r.assetId);
  const assets = await prisma.asset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, assetTag: true, name: true, status: true },
  });
  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a]));

  return result.map((r) => ({
    assetId: r.assetId,
    assetTag: assetMap[r.assetId]?.assetTag,
    name: assetMap[r.assetId]?.name,
    status: assetMap[r.assetId]?.status,
    requestCount: r._count.assetId,
    lastRequest: r._max.createdAt,
  }));
}

/**
 * Assets nearing retirement — acquired more than ageYears ago.
 */
async function getAssetsNearingRetirement(ageYears = 5) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - ageYears);

  return prisma.asset.findMany({
    where: {
      acquisitionDate: { lte: cutoff },
      status: { notIn: ['Retired', 'Disposed'] },
    },
    include: { category: { select: { name: true } } },
    orderBy: { acquisitionDate: 'asc' },
  });
}

/**
 * Overall stats.
 */
async function getOverallStats() {
  const [totalAssets, statusCounts, totalBookings, activeBookings, pendingMaintenance] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ['Upcoming', 'Ongoing'] } } }),
    prisma.maintenanceRequest.count({ where: { status: 'Pending' } }),
  ]);

  const byStatus = {};
  for (const s of statusCounts) {
    byStatus[s.status] = s._count.status;
  }

  return { totalAssets, byStatus, totalBookings, activeBookings, pendingMaintenance };
}

module.exports = {
  getAssetUtilization,
  getMaintenanceFrequency,
  getDepartmentAllocationSummary,
  getBookingHeatmap,
  getAssetsDueForMaintenance,
  getAssetsNearingRetirement,
  getOverallStats,
};
