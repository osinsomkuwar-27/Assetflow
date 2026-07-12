const { prisma } = require('../../config/db');

/**
 * Get all dashboard KPI data in a single call.
 * Role-scoped: Admin/AssetManager → org-wide, DepartmentHead → own dept, Employee → own data.
 */
async function getDashboardKPIs(userId, userRole, userDepartmentId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const isOrgWide = ['Admin', 'AssetManager'].includes(userRole);
  const isDeptScoped = userRole === 'DepartmentHead';

  // ─── Asset counts ────────────────────────────────────────────
  const assetWhere = {};
  if (isDeptScoped && userDepartmentId) {
    assetWhere.departmentId = userDepartmentId;
  }

  let assetsAvailable, assetsAllocated;
  if (isOrgWide || isDeptScoped) {
    [assetsAvailable, assetsAllocated] = await Promise.all([
      prisma.asset.count({ where: { ...assetWhere, status: 'Available' } }),
      prisma.asset.count({ where: { ...assetWhere, status: 'Allocated' } }),
    ]);
  } else {
    assetsAvailable = 0;
    assetsAllocated = await prisma.allocation.count({
      where: { holderId: userId, holderType: 'Employee', status: 'Active' },
    });
  }

  // ─── Maintenance today ───────────────────────────────────────
  const maintWhere = { createdAt: { gte: startOfDay, lt: endOfDay } };
  if (!isOrgWide && !isDeptScoped) maintWhere.raisedById = userId;
  const maintenanceToday = await prisma.maintenanceRequest.count({ where: maintWhere });

  // ─── Active bookings ────────────────────────────────────────
  const bookingWhere = { status: { in: ['Upcoming', 'Ongoing'] } };
  if (!isOrgWide) bookingWhere.bookedById = userId;
  const activeBookings = await prisma.booking.count({ where: bookingWhere });

  // ─── Pending transfers ──────────────────────────────────────
  const pendingTransfers = await prisma.transferRequest.count({ where: { status: 'Requested' } });

  // ─── Upcoming & overdue returns ─────────────────────────────
  const allocWhere = { status: 'Active', expectedReturnDate: { not: null } };
  if (!isOrgWide && !isDeptScoped) {
    allocWhere.holderId = userId;
    allocWhere.holderType = 'Employee';
  }

  const allocationsWithReturn = await prisma.allocation.findMany({
    where: allocWhere,
    include: { asset: { select: { id: true, assetTag: true, name: true } } },
    take: 20,
    orderBy: { expectedReturnDate: 'asc' },
  });

  const overdueReturns = allocationsWithReturn.filter(
    (a) => a.expectedReturnDate && new Date(a.expectedReturnDate) < now
  );
  const upcomingReturns = allocationsWithReturn.filter(
    (a) => a.expectedReturnDate && new Date(a.expectedReturnDate) >= now
  );

  // ─── Unread notifications ──────────────────────────────────
  const unreadNotifications = await prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });

  return {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns: upcomingReturns.slice(0, 10),
    overdueReturns: overdueReturns.slice(0, 10),
    unreadNotifications,
  };
}

module.exports = { getDashboardKPIs };
