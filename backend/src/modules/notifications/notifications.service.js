const { prisma } = require('../../config/db');

/**
 * Get notifications for a user, with optional filters.
 */
async function getUserNotifications(userId, { unreadOnly, type, limit = 50, skip = 0 } = {}) {
  const where = { recipientId: userId };
  if (unreadOnly) where.isRead = false;
  if (type) where.type = type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}

/**
 * Count unread notifications for a user.
 */
async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { recipientId: userId, isRead: false } });
}

/**
 * Mark a single notification as read.
 */
async function markAsRead(notificationId, userId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, recipientId: userId },
  });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all of a user's notifications as read.
 */
async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
  return { modifiedCount: result.count };
}

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
