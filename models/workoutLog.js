const mongoose = require('mongoose');
const { Schema } = mongoose;
const { DailyLog } = require('./dailyLog');
// to format dates/times
const dateTime = require('date-and-time');

const workoutLogSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: new Date()
    },
    dailyLog: {
        type: Schema.Types.ObjectId,
        ref: 'DailyLog',
        required: [true, 'DAILY LOG cannot be blank']
    },
    name: {
        type: String,
        required: [true, 'NAME cannot be blank'],
        lowercase: true
    },
    kcal: {
        type: Number,
        min: 0,
        default: 0
    },
    duration: {
        type: String,
        default : '00:00'
    },
    image: {
        type: String,
        default: '/images/default-workoutLog.svg'
    },
    notes: String,
    userId: {
        type: String,
        required: true
    }
})

workoutLogSchema.virtual('kcalPerHour').get(function(){
    if (this.duration !== '00:00' && this.kcal) {
        const minutes = this.duration.slice(0,2) * 60 + parseInt(this.duration.slice(3));
        return Math.round(this.kcal * 60 / minutes);
    } else {
        return 'n/a';
    }
});

workoutLogSchema.virtual('shortDate').get(function(){
    return dateTime.format(this.date, 'ddd DD MMM'); // Mon Jan 11
});

workoutLogSchema.virtual('longDate').get(function(){
    return dateTime.format(this.date, 'dddd, DD MMMM'); // Monday, January 11
});


workoutLogSchema.virtual('month').get(function(){
    return dateTime.format(this.date, 'YYMM MMMM YYYY'); //  2501 January 2025 (2501 will only be used to sort)
});

workoutLogSchema.statics.getAllMonths = async function(userId) {
    const allInstances = await this.find({ userId });
    let allMonths = [];
    allInstances.map(i => {
        if (!allMonths.includes(i.month))
            allMonths.push(i.month)
    });
    // Months sorted by date
    return allMonths.sort((a,b) => b.slice(0,4) - a.slice(0,4));
}

// update the associated DailyLog after a WorkoutLog is deleted
workoutLogSchema.post('findOneAndDelete', async function(deletedLog) {
    if (deletedLog) { 
        const logId = deletedLog._id;
        const dailyId = deletedLog.dailyLog;
        const daily = await DailyLog.findByIdAndUpdate(dailyId, {$pull: {workoutLogs: logId}}, {new:true, runValidators:true})
            .catch(e => next(mongoError(e)));
        
        if (!daily.mealLogs.length && !daily.workoutLogs.length) {
            await DailyLog.findByIdAndDelete(dailyId)
                .catch(e => next(mongoError(e)));
        }
    }
})

module.exports.WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);