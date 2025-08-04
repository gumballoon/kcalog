const { WorkoutLog } = require('../models/workoutLog');
const { DailyLog } = require('../models/dailyLog');
const { getDailyLog } = require('../utilities/dailyLogs');
const { textCapitalize } = require('../utilities/textCapitalize'); 
const allWorkouts = require('../seeds/data/workouts');
const { serverError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    let allWorkoutLogs = await WorkoutLog.find({})
        .catch(e => next(mongoError(e)));
    // order from newest to oldest
    allWorkoutLogs = allWorkoutLogs.sort((a,b) => b.date - a.date)

    const allMonths = await WorkoutLog.getAllMonths();

    try {
         res.render('kcalog/logs/workouts/index', { title:'Workout Logs', allWorkoutLogs, allMonths });
    } catch (e) {
        next(serverError(e));
    }
};

module.exports.renderNewForm = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    try {
        res.render('kcalog/logs/workouts/new', { title: "New Workout Log", allWorkouts, today });        
    } catch (e) {
        next(serverError(e));
    }
};

module.exports.createWorkoutLog = async (req, res, next) => {
    const newLog = new WorkoutLog(req.body.workoutLog);

    // convert the duration (00:00) to minutes
    const { duration} = req.body.workoutLog;
    newLog.minutes = duration.slice(0,2) * 60 + parseInt(duration.slice(3,5));

    // create or update an existing DailyLog instance
    newLog.dailyLog = await getDailyLog('workout', newLog);

    await newLog.save()
        .then(workoutLog => {
            req.flash('success', `${textCapitalize(workoutLog.name)} (Log) was saved`);
            res.redirect(`/logs/workouts/${workoutLog._id}`);
        })
        .catch(e => next(mongoError(e, 'Workout Log could not be saved')));
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const workoutLog = await WorkoutLog.findById(id)
        .catch(e => next(mongoError(e)));
    
    try {
        res.render('kcalog/logs/workouts/edit', { title:'Edit Workout Log', workoutLog, allWorkouts, today });
    } catch (e) {
        next(serverError(e));
    }
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
        .then(workoutLog => {
            req.flash('success', `${textCapitalize(workoutLog.name)} (Log) was updated`);
            res.redirect(`/logs/workouts/${id}`);
        })
        .catch(e => next(mongoError(e, 'Workout Log could not be updated')));
};

module.exports.showWorkoutLog = async (req, res, next) => {
    const { id } = req.params;

    const workoutLog = await WorkoutLog.findById(id)
        .catch(e => next(mongoError(e, 'Workout Log not found')));

    try {
        res.render('kcalog/logs/workouts/show', { title: textCapitalize(workoutLog.name), workoutLog})   
    } catch (e) {
        next(serverError(e));
    }
};

module.exports.destroyWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    await WorkoutLog.findByIdAndDelete(id)
        .then(workoutLog => {
            req.flash('success', `${textCapitalize(workoutLog.name)} (Log) was deleted`);
            res.redirect('/logs/workouts');
        })
        .catch(e => next(mongoError(e, 'Workout Log could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    req.flash('danger', `${err.flash || 'something went wrong'}`);
    console.log(err);
    res.status(err.status).redirect('/logs/workouts');
};