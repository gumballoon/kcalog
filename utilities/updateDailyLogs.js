const DailyLog = require('../models/dailyLog');

async function updateDailyLogs(type, log){
    const date = log.date.toDateString();
    const foundDailyLog = await DailyLog.findOne({calendarDate: date})
    let newDailyLog = '';

    if (foundDailyLog) {
        if (type === 'meal') {
            foundDailyLog.mealLogs.push(log._id);

        } else if (type === 'exercise') {
            foundDailyLog.exerciseLogs.push(log._id);
        }
        
        await foundDailyLog.save()
            .catch(e => console.log(e))
        
        console.log(foundDailyLog);
        return foundDailyLog;

    } else {
        if (type === 'meal') {
            newDailyLog = DailyLog({
                calendarDate: date,
                mealLogs: [log._id]
            })

        } else if (type === 'exercise') {
            newDailyLog = DailyLog({
                calendarDate: date,
                exerciseLogs: [log._id]
            })
        }
    
        await newDailyLog.save()
            .catch(e => console.log(e))
        
        console.log(newDailyLog);
        return newDailyLog;
    }
}

module.exports = updateDailyLogs;