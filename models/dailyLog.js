const mongoose = require('mongoose'); // import MONGOOSE

const MealLog = require('./mealLog');
const ExerciseLog = require('./exerciseLog');

const { Schema } = mongoose;

// to be added/updated automatically w/ the food & exercise logs
const dailyLogSchema = new mongoose.Schema({
    calendarDate: {
        type: String,
        required: [true, 'CALENDAR DATE cannot be blank']
    },
    mealLogs: [{
        type: Schema.Types.ObjectId,
        ref: 'MealLog'
    }],
    exerciseLogs: [{
        type: Schema.Types.ObjectId,
        ref: 'ExerciseLog'
    }]
})

dailyLogSchema.post('findOneAndDelete', async function(daily){ // daily holds the deleted instance
    // if something was succefully deleted...
    if(daily) {
        // to delete any meal log or exercise log which _id is included in the parent array
        await MealLog.deleteMany({_id: {$in: daily.mealLogs}});
        await ExerciseLog.deleteMany({_id: {$in: daily.exerciseLogs}});
    }
})

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
module.exports = DailyLog;