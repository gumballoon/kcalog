const express = require('express');
const router = express.Router();

const mealLogs = require('../controllers/mealLogs');

// INDEX & CREATE routes
router.route('/')
    .get(mealLogs.index)
    .post(mealLogs.createMealLog)

// NEW route
router.get('/new', mealLogs.renderNewForm)

// SHOW, UPDATE & DESTROY routes
router.route('/:id')
    .get(mealLogs.showMealLog)
    .put(mealLogs.updateMealLog)
    .delete(mealLogs.destroyMealLog)

// EDIT route
router.get('/:id/edit', mealLogs.renderEditForm)

module.exports = router;