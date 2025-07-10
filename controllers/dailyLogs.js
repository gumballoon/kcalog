const { DailyLog } = require('../models/dailyLog');
// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('../utilities/errors');
// populate the DailyLog to get the total Meal & Exercise kcal + balance
const { getDailyKcal } = require('../utilities/dailyLogs');

module.exports.index = async (req, res, next) => {
    const allLogs = await DailyLog.find({})
        .catch(e => next(mongoError(e)));
    if (allLogs) {
        // new var to hold the populated logs
        let allDailyLogs = allLogs;
        for (daily of allDailyLogs) {
            daily = await getDailyKcal(daily);
        }
        // ignore empty logs
        allDailyLogs = allDailyLogs.filter(d => d.mealLogs.length || d.workoutLogs.length);
        // order from newest to oldest
        allDailyLogs = allDailyLogs.sort((a,b) => new Date(b.calendarDate) - new Date(a.calendarDate));
        res.render('kcalog/logs/index', { title: 'Daily Logs', allDailyLogs });
    }
};

module.exports.showTodayLog = async (req, res, next) => {
    const today = new Date().toDateString();
    const log = await DailyLog.findOne({ calendarDate: today })
        .catch(e => next(mongoError(e)));
    console.log(log);
    if (log) {
        // new var to hold the populated log
        const dailyLog = await getDailyKcal(log);
        res.render('kcalog/logs/show', { title: dailyLog.calendarDate, dailyLog });
    } else {
        res.redirect('/kcalog/logs/');
    }
};

module.exports.showDailyLog = async (req, res, next) => {
    const { id } = req.params;
    const log = await DailyLog.findById(id)
        .catch(e => next(mongoError(e)));
    if (log) {
        // new var to hold the populated log
        const dailyLog = await getDailyKcal(log);
        res.render('kcalog/logs/show', { title: dailyLog.calendarDate, dailyLog });
    } else {
        res.redirect('/kcalog/logs/');
    }
}