const mongoose = require('mongoose'); // import MONGOOSE

const { Schema } = mongoose;

const exercises = require('../seeds/data/exercises');

const exerciseLogSchema = new Schema({
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
    name: {
        type: String,
        required: [true, 'NAME cannot be blank'],
        lowcase: true,
        enum: exercises
    },
    kcal: {
        type: Number,
        min: 0,
        required: [true, 'KCAL cannot be blank']
    },
    minutes: {
        type: Number,
        min: 1
    },
    image: String,
    notes: String
})

exerciseLogSchema.virtual('kcalPerHour').get(function(){
    if (this.minutes) {
        return Math.round(this.kcal * 60 / this.minutes);
    }
})

const ExerciseLog = mongoose.model('ExerciseLog', exerciseLogSchema);
module.exports = ExerciseLog;