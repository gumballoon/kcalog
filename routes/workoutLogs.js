const express = require('express');
const router = express.Router();
const workoutLogs = require('../controllers/workoutLogs');

// INDEX & CREATE routes
router.route('/')
    .get(workoutLogs.index)
    .post(workoutLogs.createWorkoutLog)

// NEW route
router.get('/new', workoutLogs.renderNewForm)

// SHOW, UPDATE & DESTROY routes
router.route('/:id')
    .get(workoutLogs.showWorkoutLog)
    .put(workoutLogs.updateWorkoutLog)
    .delete(workoutLogs.destroyWorkoutLog)

// EDIT route
router.get('/:id/edit', workoutLogs.renderEditForm)

// ERROR handler
router.use(workoutLogs.error)

module.exports = router;