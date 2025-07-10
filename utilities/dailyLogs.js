const { DailyLog } = require('../models/dailyLog');
// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('../utilities/errors');

// to create or update an existing DailyLog instance (after creating or updating a MealLog or ExerciseLog instance)
module.exports.getDailyLog = async (type, log, next) => {
    // to convert the DATE input value (i.e. 2025/01/01) to a Date object
    if (typeof log.date !== Date) {
        log.date = new Date(log.date);
    }
    const date = log.date.toDateString();
    const foundDailyLog = await DailyLog.findOne({calendarDate: date})
        .catch(e => next(mongoError(e)))
    let newDailyLog = '';

    if (foundDailyLog) {
        if (type === 'meal') {
            foundDailyLog.mealLogs.push(log._id);
        } else if (type === 'workout') {
            foundDailyLog.workoutLogs.push(log._id);
        }

        await foundDailyLog.save()
            .catch(e => console.log(e))
        return foundDailyLog._id;

    } else {
        if (type === 'meal') {
            newDailyLog = DailyLog({
                calendarDate: date,
                mealLogs: [log._id]
            })
        } else if (type === 'workout') {
            newDailyLog = DailyLog({
                calendarDate: date,
                workoutLogs: [log._id]
            })
        }
    
        await newDailyLog.save()
            .catch(e => console.log(e))
        return newDailyLog._id;
    }
}

// to populate the Daily Log to get the Meal & Workout total kcal + balance
module.exports.getDailyKcal = async (daily) => {
    let totalMealKcal = 0;
    await daily.populate('mealLogs')
        .then(res => {
            for (m of res.mealLogs){
                totalMealKcal += m.kcal;
            }
        })
    daily.totalMealKcal = totalMealKcal;

    let totalWorkoutKcal = 0;
    await daily.populate('workoutLogs')
        .then(res => {
            for (w of res.workoutLogs){
                totalWorkoutKcal += w.kcal;
            }
        })
    daily.totalWorkoutKcal = totalWorkoutKcal;

    daily.kcalBalance = totalMealKcal - totalWorkoutKcal;

    return daily;
}