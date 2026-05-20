const { DailyLog } = require('../models/dailyLog');
const { mongoError } = require('../utilities/errors');
const { getDailyKcal } = require('../utilities/dailyLogs');

module.exports.getHome = async (req, res, next) => {
    const userId = req.userId;
    const now = new Date();
    const daily = await DailyLog.findOne({ userId, calendarDate: now.toDateString() })
        .catch(e => next(mongoError(e)));

    let dailyStats = null;
    if (daily && (daily.mealLogs.length || daily.workoutLogs.length)) {
        dailyStats = await getDailyKcal(daily);
    }
    res.json({ dailyStats });
};

module.exports.index = async (req, res, next) => {
    const userId = req.userId;
    const allLogs = await DailyLog.find({ userId }).catch(e => next(mongoError(e)));
    const allMonths = await DailyLog.getAllMonths(userId);

    if (allLogs) {
        let allDailyLogs = allLogs;
        for (let daily of allDailyLogs) {
            daily = await getDailyKcal(daily);
        }
        allDailyLogs = allDailyLogs.filter(d => d.mealLogs.length || d.workoutLogs.length);
        allDailyLogs = allDailyLogs.sort((a, b) => new Date(b.calendarDate) - new Date(a.calendarDate));
        res.json({ allDailyLogs, allMonths });
    }
};

module.exports.showTodayLog = async (req, res, next) => {
    const userId = req.userId;
    const today = new Date().toDateString();
    const log = await DailyLog.findOne({ userId, calendarDate: today }).catch(e => next(mongoError(e)));
    if (log) {
        const dailyLog = await getDailyKcal(log);
        res.json({ dailyLog });
    } else {
        res.json({ dailyLog: null });
    }
};

module.exports.showDailyLog = async (req, res, next) => {
    const { id } = req.params;
    const log = await DailyLog.findById(id).catch(e => next(mongoError(e)));
    if (log) {
        const dailyLog = await getDailyKcal(log);
        res.json({ dailyLog });
    } else {
        res.status(404).json({ error: 'daily log not found' });
    }
};
