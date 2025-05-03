const mongoose = require('mongoose'); // import MONGOOSE
const { Schema } = mongoose;

const mealLogSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: new Date().toISOString().split('T')[0]
    },
    dailyLog: {
        type: Schema.Types.ObjectId,
        ref: 'DailyLog',
        required: [true, 'DAILY LOG cannot be blank']
    },
    meal: {
        type: Schema.Types.ObjectId,
        ref: 'Meal'
        // not required since it can be deleted afterwards
    },
    name: {
        type: String,
        required: [true, 'NAME cannot be blank'],
        lowcase: true
    },
    quantity: {
        dosage: {
            type: Number,
            min: 0
        },
        grams: {
            type: Number,
            min: 0
        }
    },
    kcal: {
        type: Number,
        required: [true, 'KCAL cannot be blank']
    },
    image: String,
    notes: String
})

const MealLog = mongoose.model('MealLog', mealLogSchema);
module.exports = MealLog;