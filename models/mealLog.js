const mongoose = require('mongoose'); // import MONGOOSE
const { Schema } = mongoose;
const { Meal, mealSchema } = require('./meal');

// when created, MealLog will use Meal as a template on which it adds-on
const mealLogSchema = new Schema({
    mealSchema,
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
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dinner']
    },
    image: String,
    notes: String
})

module.exports.MealLog = mongoose.model('MealLog', mealLogSchema);