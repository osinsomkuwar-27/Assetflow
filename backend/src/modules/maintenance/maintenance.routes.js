const express = require('express');
const router = express.Router();
const controller = require('./maintenance.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);

// Any authenticated user can create a request (service enforces holder/role check)
router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Approval workflow — Admin and AssetManager only
router.post('/:id/approve', requireRole('Admin', 'AssetManager'), controller.approve);
router.post('/:id/reject', requireRole('Admin', 'AssetManager'), controller.reject);
router.post('/:id/assign', requireRole('Admin', 'AssetManager'), controller.assign);
router.post('/:id/start', requireRole('Admin', 'AssetManager'), controller.start);
router.post('/:id/resolve', requireRole('Admin', 'AssetManager'), controller.resolve);

// Per-asset maintenance history
router.get('/asset/:assetId', controller.history);

module.exports = router;
