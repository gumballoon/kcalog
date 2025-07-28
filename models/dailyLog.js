const mongoose = require('mongoose');
const { Schema } = mongoose;
// to format dates/times
const dateTime = require('date-and-time'); 
const { required } = require('joi');

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
    }],
    image: {
        type: String,
        default: '/images/default-dailyLog.svg'
    },
    userId: {
        type: String,
        default: 'wifey',
        required: true
    }
})

dailyLogSchema.virtual('shortDate').get(function(){
    return dateTime.format(new Date(this.calendarDate), 'ddd DD MMM'); // Mon Jan 11
});

dailyLogSchema.virtual('longDate').get(function(){
    return dateTime.format(new Date(this.calendarDate), 'dddd, DD MMMM'); // Monday, January 11
});

dailyLogSchema.virtual('month').get(function(){
    return dateTime.format(new Date(this.calendarDate), 'MM MMMM YYYY'); // 01 January 2025
});

dailyLogSchema.statics.getAllMonths = async function() {
    const allInstances = await this.find({});
    let allMonths = [];
    allInstances.map(i => {
        if (!allMonths.includes(i.month))
            allMonths.push(i.month)
    });
    return allMonths.sort((a,b) => b.slice(0,2) - a.slice(0,2));
}

module.exports.DailyLog = mongoose.model('DailyLog', dailyLogSchema);