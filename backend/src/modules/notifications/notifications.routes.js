const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', controller.getMyNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.post('/:id/read', controller.markAsRead);
router.post('/read-all', controller.markAllAsRead);

module.exports = router;
