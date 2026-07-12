const svc = require('./notifications.service');
const { ok } = require('../../shared/utils/responseFormatter');

async function getMyNotifications(req, res, next) {
  try {
    const { unreadOnly, type, limit, skip } = req.query;
    const result = await svc.getUserNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      type: type || undefined,
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
    });
    return ok(res, result, 'Notifications fetched');
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await svc.markAsRead(req.params.id, req.user.id);
    return ok(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await svc.markAllAsRead(req.user.id);
    return ok(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await svc.getUnreadCount(req.user.id);
    return ok(res, { count }, 'Unread count fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };
