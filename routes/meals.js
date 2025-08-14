const express = require('express');
const router = express.Router();
const meals = require('../controllers/meals');
const { isLoggedIn } = require('../utilities/middleware');

// apply isLoggedIn to ALL routes in this router
router.use(isLoggedIn);

// INDEX & CREATE routes
router.route('/')
    .get(meals.index)
    .post(meals.createMeal)

// NEW route
router.get('/new', meals.renderNewForm)

// SHOW, UPDATE & DESTROY routes
router.route('/:id')
    .get(meals.showMeal)
    .put(meals.updateMeal)
    .delete(meals.destroyMeal)

// EDIT route
router.get('/:id/edit', meals.renderEditForm)

// ERROR handler
router.use(meals.error)

module.exports = router;