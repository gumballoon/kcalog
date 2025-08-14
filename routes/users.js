const express = require('express');
const router = express.Router();
const { isLoggedIn, isLoggedOut } = require('../utilities/middleware');
const users = require('../controllers/users');

// REGISTER routes
router.route('/register')
    .get(users.renderRegisterForm)
    .post(users.registerUser)

// LOGIN routes
router.route('/login')
    .get(isLoggedOut, users.renderLoginForm)
    .post(isLoggedOut, users.loginUser)

// LOGOUT route
router.get('/logout', isLoggedIn, users.logoutUser)

// ERROR handler
router.use(users.error)

module.exports = router;