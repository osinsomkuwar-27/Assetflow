const express = require('express');
const router = express.Router();
const controller = require('./reports.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);

router.get('/utilization', requireRole('Admin', 'AssetManager', 'DepartmentHead'), controller.utilization);
router.get('/maintenance-frequency', requireRole('Admin', 'AssetManager'), controller.maintenanceFrequency);
router.get('/department-summary', requireRole('Admin', 'AssetManager', 'DepartmentHead'), controller.departmentSummary);
router.get('/booking-heatmap', requireRole('Admin', 'AssetManager'), controller.bookingHeatmap);
router.get('/assets-due-maintenance', requireRole('Admin', 'AssetManager'), controller.assetsDueMaintenance);
router.get('/assets-nearing-retirement', requireRole('Admin', 'AssetManager'), controller.assetsNearingRetirement);
router.get('/stats', requireRole('Admin', 'AssetManager'), controller.stats);

module.exports = router;
