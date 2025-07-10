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
    image: String,
    notes: String,
    userId: {
        type: String,
        default: 'wifey',
        required: true
    }
})

workoutLogSchema.virtual('shortDate').get(function(){
    return dateTime.format(this.date, 'ddd DD MMM'); // Mon Jan 11
});

workoutLogSchema.virtual('longDate').get(function(){
    return dateTime.format(this.date, 'dddd, DD MMMM'); // Monday, January 11
});

workoutLogSchema.virtual('kcalPerHour').get(function(){
    if (this.duration !== '00:00' && this.kcal) {
        const minutes = this.duration.slice(0,2) * 60 + parseInt(this.duration.slice(3));
        return Math.round(this.kcal * 60 / minutes);
    } else {
        return 'n/a';
    }
});

// update the associated DailyLog after a WorkoutLog is deleted
workoutLogSchema.post('findOneAndDelete', async function (deletedLog) {
    if (deletedLog) { 
        const logId = deletedLog._id;
        const dailyId = deletedLog.dailyLog;
        await DailyLog.findByIdAndUpdate(dailyId, {$pull: {workoutLogs: logId}}, {new:true, runValidators:true})
            .catch(e => console.log(e));
    }
})

module.exports.WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);