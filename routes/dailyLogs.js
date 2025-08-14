const express = require('express');
const router = express.Router();
const dailyLogs = require('../controllers/dailyLogs');
const { isLoggedIn } = require('../utilities/middleware');

// apply isLoggedIn to ALL routes in this router
router.use(isLoggedIn);

// INDEX route
router.get('/', dailyLogs.index);

// SHOW route w/ today's log
router.get('/today', dailyLogs.showTodayLog);

// SHOW route
router.get('/:id', dailyLogs.showDailyLog);

module.exports = router;