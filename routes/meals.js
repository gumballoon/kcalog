const express = require('express');
const router = express.Router();

const meals = require('../controllers/meals');

// INDEX & CREATE routes
router.route('/')
    .get(meals.index)
    .post(meals.createMeal)

// NEW route
router.get('/new', meals.renderNewForm)

// SHOW, UPDATE & DESTROY routes
router.route('/:id')
    .get(meals.showMeal)
    .post(meals.updateMeal)
    .delete(meals.destroyMeal)

// EDIT route
router.get('/:id/edit', meals.renderEditForm)

module.exports = router;