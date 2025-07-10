const mongoose = require('mongoose');
const { Schema } = mongoose;
const { mealSchema } = require('./meal');
const { DailyLog } = require('./dailyLog');
 // to format dates/times
const dateTime = require('date-and-time');

const mealLogSchema = new Schema({
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
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dinner']
    },
    meal: mealSchema,
    grams: {
        type: Number,
        required: [function () {
            return this.meal && this.meal.serving === 'full';
        }, 'GRAMS is required when SERVING is full']
    },
    fullTotalKcal: Number,
    image: String,
    notes: String,
    userId: {
        type: String,
        default: 'wifey',
        required: true
    }
})

// to calculate the FULL TOTAL KCAL (if it wasn't provided)
mealLogSchema.pre('save', function(next) {
    if (this.grams && !this.fullTotalKcal) {
        this.fullTotalKcal = Math.round(this.grams * this.meal.kcalPerGram);
    }
    return next();
});

mealLogSchema.virtual('shortDate').get(function(){
    return dateTime.format(this.date, 'ddd DD MMM'); // Mon Jan 11
});
mealLogSchema.virtual('longDate').get(function(){
    return dateTime.format(this.date, 'dddd, DD MMMM'); // Monday, January 11
});

// to get the MEAL kcal (regardless of serving)
mealLogSchema.virtual('kcal').get(function(){
    if (this.meal.serving === 'single') {
        return this.meal.totalKcal;
    } else {
        return this.fullTotalKcal;
    }
});

// to update the associated DailyLog after a MealLog is deleted
mealLogSchema.post('findOneAndDelete', async function (deletedLog) {
    if (deletedLog) { 
        const logId = deletedLog._id;
        const dailyId = deletedLog.dailyLog;
        await DailyLog.findByIdAndUpdate(dailyId, {$pull: {mealLogs: logId}}, {new:true, runValidators:true})
            .catch(e => console.log(e));
    }
})

module.exports.MealLog = mongoose.model('MealLog', mealLogSchema);