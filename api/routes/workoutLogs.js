const express = require('express');
const router = express.Router();
const workoutLogs = require('../controllers/workoutLogs');
const { verifyToken } = require('../utilities/auth');

router.use(verifyToken);

router.route('/')
    .get(workoutLogs.index)
    .post(workoutLogs.createWorkoutLog);

router.get('/form-data', workoutLogs.getFormData);

router.route('/:id')
    .get(workoutLogs.showWorkoutLog)
    .put(workoutLogs.updateWorkoutLog)
    .delete(workoutLogs.destroyWorkoutLog);

router.get('/:id/form-data', workoutLogs.getEditFormData);

router.use(workoutLogs.error);

module.exports = router;
