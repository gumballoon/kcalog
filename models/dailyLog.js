const mongoose = require('mongoose');
const { Schema } = mongoose;
// to format dates/times
const dateTime = require('date-and-time'); 

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

dailyLogSchema.virtual('shortDate').get(function(){
    return dateTime.format(new Date(this.calendarDate), 'ddd DD MMM'); // Mon Jan 11
});

dailyLogSchema.virtual('longDate').get(function(){
    return dateTime.format(new Date(this.calendarDate), 'dddd, DD MMMM'); // Monday, January 11
});

module.exports.DailyLog = mongoose.model('DailyLog', dailyLogSchema);