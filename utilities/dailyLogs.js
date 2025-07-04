const { DailyLog } = require('../models/dailyLog');

// to create or update a Daily Log (after creating or updating a Meal/Exercise Log)
module.exports.updateDailyLogs = async (type, log) => {
    if (typeof log.date !== Date) log.date = new Date(log.date);
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

// populate the Daily Log to get the Meal & Workout total kcal + balance
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