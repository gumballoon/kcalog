const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// array with all possible exercises
const exercises = require('../seeds/data/exercises');

module.exports.exerciseLogSchema = Joi.object({
    exerciseLog: Joi.object({
        date: Joi.string().required(),
        time: Joi.string().required(),
        name: Joi.string().required().lowercase().valid(...exercises),
        kcal: Joi.number().required(),
        minutes: Joi.number(),
        image: Joi.string(),
        notes: Joi.string()
    })
})

module.exports.dailyLogSchema = Joi.object({
    dailyLog: Joi.object({
        date: Joi.string().required(),
        mealLogs: Joi.array().items(Joi.objectId()),
        exerciseLogs: Joi.array().items(Joi.objectId())
    }).required()
})