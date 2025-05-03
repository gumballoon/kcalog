const express = require('express');
const router = express.Router();
const DailyLog = require('../models/dailyLog');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// populate the Daily Log to get the total Meal & Exercise kcal
async function getTotalKcal(daily){
        let totalMealKcal = 0;
        await daily.populate('mealLogs')
        .then(res => {
            for (m of res.mealLogs){
                totalMealKcal += m.kcal;
            }
        })
        daily.totalMealKcal = totalMealKcal;

        let totalExerciseKcal = 0;
        await daily.populate('exerciseLogs')
        .then(res => {
            for (e of res.exerciseLogs){
                totalExerciseKcal += e.kcal;
            }
        })
        daily.totalExerciseKcal = totalExerciseKcal;

        daily.kcalBalance = totalMealKcal - totalExerciseKcal;

        return daily;
}

// INDEX route
router.get('/', async (req, res, next) => {
    const allLogs = await DailyLog.find({})
        .catch(e => next(mongoError(e)));
    if (allLogs) {
        // new var to hold the modified logs
        let allDailyLogs = allLogs;
        for (daily of allDailyLogs) {
            daily = await getTotalKcal(daily);
        }
        // order from most recent to oldest
        allDailyLogs = allDailyLogs.sort((a,b) => new Date(b.calendarDate) - new Date(a.calendarDate));
        res.render('kcalog/logs/index', { title: 'Daily Logs', allDailyLogs })
    }
})

// SHOW route
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const log = await DailyLog.findById(id)
        .catch(e => next(mongoError(e)));
    // new var to hold the modified log
    const dailyLog = await getTotalKcal(log);
    res.render('kcalog/logs/show', { title: dailyLog.calendarDate, dailyLog })
})

// DESTROY route
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    await DailyLog.findByIdAndDelete(id)
        .then(() => res.redirect('/kcalog/logs'))
        .catch(e => next(mongoError(e)))
})

module.exports = router;