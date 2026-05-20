const { WorkoutLog } = require('../models/workoutLog');
const { DailyLog } = require('../models/dailyLog');
const { getDailyLog } = require('../utilities/dailyLogs');
const { textCapitalize } = require('../utilities/textCapitalize');
const allWorkouts = require('../../public/data/workouts');
const { mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const userId = req.userId;
    let allWorkoutLogs = await WorkoutLog.find({ userId }).catch(e => next(mongoError(e)));
    allWorkoutLogs = allWorkoutLogs.sort((a, b) => b.date - a.date);
    const allMonths = await WorkoutLog.getAllMonths(userId);
    res.json({ allWorkoutLogs, allMonths });
};

module.exports.getFormData = (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json({ today, allWorkouts });
};

module.exports.createWorkoutLog = async (req, res, next) => {
    const userId = req.userId;
    const newLog = new WorkoutLog(req.body.workoutLog);
    newLog.userId = userId;

    const { duration } = req.body.workoutLog;
    newLog.minutes = duration.slice(0, 2) * 60 + parseInt(duration.slice(3, 5));
    newLog.dailyLog = await getDailyLog('workout', newLog, next);

    await newLog.save()
        .then(workoutLog => res.status(201).json({ workoutLog, message: `${textCapitalize(workoutLog.name)} (Log) was saved` }))
        .catch(e => next(mongoError(e, 'Workout Log could not be saved')));
};

module.exports.getEditFormData = async (req, res, next) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const workoutLog = await WorkoutLog.findById(id).catch(e => next(mongoError(e)));
    res.json({ workoutLog, today, allWorkouts });
};

module.exports.updateWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    const updatedLog = req.body.workoutLog;

    const oldLog = await WorkoutLog.findById(id);
    if (oldLog.date.toDateString() !== new Date(updatedLog.date).toDateString()) {
        await DailyLog.findByIdAndUpdate(oldLog.dailyLog, { $pull: { workoutLogs: id } }, { new: true, runValidators: true });
        updatedLog.dailyLog = await getDailyLog('workout', updatedLog, next);
    } else {
        updatedLog.dailyLog = oldLog.dailyLog;
    }

    await WorkoutLog.findByIdAndUpdate(id, updatedLog, { new: true, runValidators: true })
        .then(workoutLog => res.json({ workoutLog, message: `${textCapitalize(workoutLog.name)} (Log) was updated` }))
        .catch(e => next(mongoError(e, 'Workout Log could not be updated')));
};

module.exports.showWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    const workoutLog = await WorkoutLog.findById(id).catch(e => next(mongoError(e, 'Workout Log not found')));
    res.json({ workoutLog });
};

module.exports.destroyWorkoutLog = async (req, res, next) => {
    const { id } = req.params;
    await WorkoutLog.findByIdAndDelete(id)
        .then(workoutLog => res.json({ message: `${textCapitalize(workoutLog.name)} (Log) was deleted` }))
        .catch(e => next(mongoError(e, 'Workout Log could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
};
