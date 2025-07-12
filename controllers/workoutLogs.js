const { WorkoutLog } = require('../models/workoutLog');
const { DailyLog } = require('../models/dailyLog');
const { getDailyLog, updateDailyLog } = require('../utilities/dailyLogs');
const { textCapitalize } = require('../utilities/textCapitalize'); 
const allWorkouts = require('../seeds/data/workouts');
// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    let allWorkoutLogs = await WorkoutLog.find({})
        .catch(e => next(mongoError(e)));

    // order from newest to oldest
    allWorkoutLogs = allWorkoutLogs.sort((a,b) => b.date - a.date)

    res.render('kcalog/logs/workouts/index', { title:'Workout Logs', allWorkoutLogs })
};

module.exports.renderNewForm = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    res.render('kcalog/logs/workouts/new', { title: "New Workout Log", allWorkouts, today });
};

module.exports.createWorkoutLog = async (req, res, next) => {
    const newLog = new WorkoutLog(req.body.workoutLog);
    newLog.image =  '/images/default-workoutLog.svg';

    // convert the duration (00:00) to minutes
    const { duration} = req.body.workoutLog;
    newLog.minutes = duration.slice(0,2) * 60 + parseInt(duration.slice(3,5));

    // create or update an existing DailyLog instance
    newLog.dailyLog = await getDailyLog('workout', newLog);

    await newLog.save()
        .then(() => res.redirect(`/logs/workouts/${newLog._id}`))
        .catch(e => next(mongoError(e)));
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const workoutLog = await WorkoutLog.findById(id)
        .catch(e => next(mongoError(e)))
    
    res.render('kcalog/logs/workouts/edit', { title:'Edit Workout Log', workoutLog, allWorkouts, today })
};

module.exports.updateWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    const updatedLog = req.body.workoutLog;

    const oldLog = await WorkoutLog.findById(id);
    // if the DATE was updated
    if (oldLog.date.toDateString() !== new Date(updatedLog.date).toDateString()) {
        const oldDaily = oldLog.dailyLog;
        await DailyLog.findByIdAndUpdate(oldDaily, {$pull: {workoutLogs: id}}, {new:true, runValidators:true});
        updatedLog.dailyLog = await getDailyLog('workout', updatedLog);
    } else {
        updatedLog.dailyLog = oldLog.dailyLog;
    }     

    await WorkoutLog.findByIdAndUpdate(id, updatedLog, {new:true, runValidators:true})
        .then(() => res.redirect(`/logs/workouts/${id}`))
        .catch(e => next(mongoError(e)))
};

module.exports.showWorkoutLog = async (req, res, next) => {
    const { id } = req.params;

    const workoutLog = await WorkoutLog.findById(id)
        .catch(e => next(mongoError(e)))
        
    res.render('kcalog/logs/workouts/show', { title: textCapitalize(workoutLog.name), workoutLog})
};

module.exports.destroyWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    await WorkoutLog.findByIdAndDelete(id)
        .catch(e => next(mongoError(e)))
    
    res.redirect('/logs/workouts');
};