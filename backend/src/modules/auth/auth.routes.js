const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
