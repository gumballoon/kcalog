const express = require('express');
const router = express.Router();
const { ExerciseLog } = require('../models/exerciseLog');
const { DailyLog } = require('../models/dailyLog');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// to add a new DailyLog or update one
const updateDailyLogs = require('../utilities/updateDailyLogs')

// // // // // // // //

// INDEX route
router.get('/', async (req, res, next) => {
    let allExerciseLogs = await ExerciseLog.find({})
        .catch(e => next(mongoError(e)));
    // order from most recent to oldest
    allExerciseLogs = allExerciseLogs.sort((a,b) => b.date - a.date)
    res.render('kcalog/logs/exercises/index', { title:'Exercise Logs', allExerciseLogs })
})

// NEW route
router.get('/new', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const allExercises = require('../seeds/data/exercises');
    res.render('kcalog/logs/exercises/new', { title: "New Exercise Log", allExercises, today });
})

// CREATE route
router.post('/', async (req, res, next) => {
    const newLog = new ExerciseLog(req.body.exerciseLog);
    newLog.image = `https://picsum.photos/400?random=${Math.random()}`;
    const { duration} = req.body.exerciseLog;
    newLog.minutes = duration.slice(0,2) * 60 + parseInt(duration.slice(3,5));

    newLog.dailyLog = await updateDailyLogs('exercise', newLog);

    await newLog.save()
        .then(() => res.redirect(`/kcalog/logs/exercises/${newLog._id}`))
        .catch(e => next(mongoError(e)));
})

// EDIT route
router.get('/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    const allExercises = require('../seeds/data/exercises');
    await ExerciseLog.findById(id)
        .then(exerciseLog => res.render('kcalog/logs/exercises/edit', { title:'Edit Exercise Log', exerciseLog, allExercises }))
        .catch(e => next(mongoError(e)))
})

// UPDATE route
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    await ExerciseLog.findByIdAndUpdate(id, req.body.exerciseLog, {runValidators:true})
        .catch(e => next(mongoError(e)))
    res.redirect(`/kcalog/logs/exercises/${id}`);
})

// SHOW route
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    await ExerciseLog.findById(id)
        .then(exerciseLog => res.render('kcalog/logs/exercises/show', { title: exerciseLog.name, exerciseLog}))
        .catch(e => next(mongoError(e)))
})

// DESTROY route
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    const deletedLog = await ExerciseLog.findByIdAndDelete(id)
        .catch(e => next(mongoError(e)))

    // to update the associated DailyLog
    const dailyId = deletedLog.dailyLog;
    const updatedLog = await DailyLog.findByIdAndUpdate(dailyId, {$pull: {exerciseLogs: deletedLog._id}}, {new:true, runValidators:true})
        .catch(e => next(mongoError(e)))
    // to delete the associated DailyLog if it's empty (no Meal or Exercise logs)
    if (!updatedLog.mealLogs.length && !updatedLog.exerciseLogs.length) {
        await DailyLog.findByIdAndDelete(dailyId);
    }
    res.redirect('/kcalog/logs/exercises');
})

module.exports = router;