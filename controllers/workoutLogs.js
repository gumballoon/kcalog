const { WorkoutLog } = require('../models/workoutLog');
const { DailyLog } = require('../models/dailyLog');
const { capitalize } = require('../utilities/capitalize'); 

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// to create or update a Daily Log 
const { updateDailyLogs } = require('../utilities/dailyLogs')

module.exports.index = async (req, res, next) => {
    let allWorkoutLogs = await WorkoutLog.find({})
        .catch(e => next(mongoError(e)));
    // order from most recent to oldest
    allWorkoutLogs = allWorkoutLogs.sort((a,b) => b.date - a.date)
    res.render('kcalog/logs/workouts/index', { title:'Workout Logs', allWorkoutLogs })
};

module.exports.renderNewForm = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const allWorkouts = require('../seeds/data/workouts');
    res.render('kcalog/logs/workouts/new', { title: "New Workout Log", allWorkouts, today });
};

module.exports.createWorkoutLog = async (req, res, next) => {
    const newLog = new WorkoutLog(req.body.workoutLog);
    newLog.image =  '/images/default-workoutLog.svg';
    const { duration} = req.body.workoutLog;
    newLog.minutes = duration.slice(0,2) * 60 + parseInt(duration.slice(3,5));

    newLog.dailyLog = await updateDailyLogs('workout', newLog);

    await newLog.save()
        .then(() => res.redirect(`/kcalog/logs/workouts/${newLog._id}`))
        .catch(e => next(mongoError(e)));
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const allWorkouts = require('../seeds/data/workouts');
    await WorkoutLog.findById(id)
        .then(workoutLog => res.render('kcalog/logs/workouts/edit', { title:'Edit Workout Log', workoutLog, allWorkouts, today }))
        .catch(e => next(mongoError(e)))
};

module.exports.updateWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    const updatedLog = req.body.workoutLog;

    const oldLog = await WorkoutLog.findById(id);
    // if the DATE was updated
    if (oldLog.date.toDateString() !== new Date(updatedLog.date).toDateString()) {
        const oldDaily = oldLog.dailyLog;
        await DailyLog.findByIdAndUpdate(oldDaily, {$pull: {workoutLogs: id}}, {new:true, runValidators:true});
        updatedLog.dailyLog = await updateDailyLogs('workout', updatedLog);
    } else {
        updatedLog.dailyLog = oldLog.dailyLog;
    }     

    await WorkoutLog.findByIdAndUpdate(id, updatedLog, {new:true, runValidators:true})
        .then(() => res.redirect(`/kcalog/logs/workouts/${id}`))
        .catch(e => next(mongoError(e)))
};

module.exports.showWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    await WorkoutLog.findById(id)
        .then(workoutLog => res.render('kcalog/logs/workouts/show', { title: capitalize(workoutLog.name), workoutLog}))
        .catch(e => next(mongoError(e)))
};

module.exports.destroyWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    const deletedLog = await WorkoutLog.findByIdAndDelete(id)
        .catch(e => next(mongoError(e)))

    // to update the associated DailyLog
    const dailyId = deletedLog.dailyLog;
    const updatedLog = await DailyLog.findByIdAndUpdate(dailyId, {$pull: {workoutLogs: deletedLog._id}}, {new:true, runValidators:true})
        .catch(e => next(mongoError(e)))
    // to delete the associated DailyLog if it's empty (no Meal/Workout logs)
    if (!updatedLog.mealLogs.length && !updatedLog.workoutLogs.length) {
        await DailyLog.findByIdAndDelete(dailyId);
    }
    res.redirect('/kcalog/logs/workouts');
};