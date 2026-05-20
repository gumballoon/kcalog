const express = require('express');
const router = express.Router();
const dailyLogs = require('../controllers/dailyLogs');
const { verifyToken } = require('../utilities/auth');

router.use(verifyToken);

router.get('/home', dailyLogs.getHome);
router.get('/', dailyLogs.index);
router.get('/today', dailyLogs.showTodayLog);
router.get('/:id', dailyLogs.showDailyLog);

module.exports = router;
