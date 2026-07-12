const express = require('express');
const router = express.Router();
const controller = require('./audits.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);

router.post('/cycles', requireRole('Admin', 'AssetManager'), controller.createCycle);
router.get('/cycles', requireRole('Admin', 'AssetManager'), controller.listCycles);
router.get('/cycles/:id', controller.getCycle);
router.post('/cycles/:id/verify', controller.verifyItem);
router.get('/cycles/:id/discrepancies', requireRole('Admin', 'AssetManager'), controller.getDiscrepancies);
router.post('/cycles/:id/close', requireRole('Admin', 'AssetManager'), controller.closeCycle);

module.exports = router;
