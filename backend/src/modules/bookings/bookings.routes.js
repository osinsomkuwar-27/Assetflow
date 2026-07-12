const express = require('express');
const router = express.Router();
const controller = require('./bookings.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', controller.create);
router.post('/:id/cancel', controller.cancel);
router.get('/asset/:assetId', controller.listForAsset);

module.exports = router;
