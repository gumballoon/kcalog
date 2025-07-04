const mongoose = require('mongoose'); // import MONGOOSE
const { Schema } = mongoose;
const { mealSchema } = require('./meal');
const dateTime = require('date-and-time'); // to format dates/times

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
    notes: String
})

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

// to get the meal's kcal (regardless of serving)
mealLogSchema.virtual('kcal').get(function(){
    if (this.meal.serving === 'single') {
        return this.meal.totalKcal;
    } else {
        return this.fullTotalKcal;
    }
});

module.exports.MealLog = mongoose.model('MealLog', mealLogSchema);