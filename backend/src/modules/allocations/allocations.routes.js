const express = require('express');
const router = express.Router();
const controller = require('./allocations.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);

router.post('/', requireRole('Admin', 'AssetManager', 'DepartmentHead'), controller.allocate);
router.post('/transfer-request', controller.transferRequest);
router.post('/transfer/:id/approve', requireRole('Admin', 'AssetManager', 'DepartmentHead'), controller.transferApprove);
router.post('/return', controller.returnAsset);
router.get('/history/:assetId', controller.history);

module.exports = router;
