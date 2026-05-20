const express = require('express');
const router = express.Router();
const { verifyToken, requireGuest } = require('../utilities/auth');
const users = require('../controllers/users');

router.get('/auth/me', verifyToken, users.getMe);
router.post('/auth/register', requireGuest, users.registerUser);
router.post('/auth/login', requireGuest, users.loginUser);
router.post('/auth/logout', verifyToken, users.logoutUser);

router.use(users.error);

module.exports = router;
