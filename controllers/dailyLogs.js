const { DailyLog } = require('../models/dailyLog');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// populate the Daily Log to get the total Meal & Exercise kcal
const { getDailyKcal } = require('../utilities/dailyLogs');

module.exports.index = async (req, res, next) => {
    const allLogs = await DailyLog.find({})
        .catch(e => next(mongoError(e)));
    if (allLogs) {
        // new var to hold the modified logs
        let allDailyLogs = allLogs;
        for (daily of allDailyLogs) {
            daily = await getDailyKcal(daily);
        }
        // // ignore empty logs
        allDailyLogs = allDailyLogs.filter(d => d.mealLogs.length || d.workoutLogs.length)
        // order from most recent to oldest
        allDailyLogs = allDailyLogs.sort((a,b) => new Date(b.calendarDate) - new Date(a.calendarDate));
        res.render('kcalog/logs/index', { title: 'Daily Logs', allDailyLogs })
    }
};

module.exports.showTodayLog = async (req, res, next) => {
    const today = new Date().toDateString();
    const log = await DailyLog.findOne({ calendarDate: today })
        .catch(e => next(mongoError(e)));
    // new var to hold the modified log
    if (log) {
        const dailyLog = await getDailyKcal(log);
        res.render('kcalog/logs/show', { title: dailyLog.calendarDate, dailyLog })
    } else {
        res.redirect('/kcalog/logs/')
    }
};

module.exports.showDailyLog = async (req, res, next) => {
    const { id } = req.params;
    const log = await DailyLog.findById(id)
        .catch(e => next(mongoError(e)));
    // new var to hold the modified log
    const dailyLog = await getDailyKcal(log);
    res.render('kcalog/logs/show', { title: dailyLog.calendarDate, dailyLog })
}