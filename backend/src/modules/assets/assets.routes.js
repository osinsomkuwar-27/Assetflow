const express = require('express');
const router = express.Router();
const controller = require('./assets.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);

router.post('/', requireRole('Admin', 'AssetManager'), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.put('/:id', requireRole('Admin', 'AssetManager'), controller.update);

module.exports = router;
