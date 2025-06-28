const { DailyLog } = require('../models/dailyLog');

// to create or update a Daily Log (after creating or updating a Meal/Exercise Log)
module.exports.updateDailyLogs = async (type, log) => {
    const date = log.date.toDateString();
    const foundDailyLog = await DailyLog.findOne({calendarDate: date})
    let newDailyLog = '';

    if (foundDailyLog) {
        if (type === 'meal') {
            foundDailyLog.mealLogs.push(log._id);

        } else if (type === 'workout') {
            foundDailyLog.workoutLogs.push(log._id);
        }
        
        await foundDailyLog.save()
            .catch(e => console.log(e))
        
        // console.log(foundDailyLog);
        return foundDailyLog;

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
        
        // console.log(newDailyLog);
        return newDailyLog;
    }
}

// populate the Daily Log to get the Meal - Workout kcal balance
module.exports.getDailyKcalBalance = async (daily) => {
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
        for (e of res.workoutLogs){
            totalWorkoutKcal += e.kcal;
        }
    })
    daily.totalWorkoutKcal = totalWorkoutKcal;

    daily.kcalBalance = totalMealKcal - totalWorkoutKcal;

    return daily;
}