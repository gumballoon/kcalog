const mongoose = require('mongoose'); // import MONGOOSE

const MealLog = require('./mealLog');
const WorkoutLog = require('./workoutLog');

const { Schema } = mongoose;

// to be added/updated automatically w/ the Meal & Workout logs
const dailyLogSchema = new mongoose.Schema({
    calendarDate: {
        type: String,
        required: [true, 'CALENDAR DATE cannot be blank']
    },
    mealLogs: [{
        type: Schema.Types.ObjectId,
        ref: 'MealLog'
    }],
    workoutLogs: [{
        type: Schema.Types.ObjectId,
        ref: 'WorkoutLog'
    }]
})

dailyLogSchema.post('findOneAndDelete', async function(daily){ // daily holds the deleted instance
    // if something was succefully deleted...
    if(daily) {
        // to delete any Meal/Workout log which _id is included in the parent array
        await MealLog.deleteMany({_id: {$in: daily.mealLogs}});
        await WorkoutLog.deleteMany({_id: {$in: daily.workoutLogs}});
    }
})

module.exports.DailyLog = mongoose.model('DailyLog', dailyLogSchema);