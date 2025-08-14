const express = require('express');
const router = express.Router();
const ingredients = require('../controllers/ingredients');
const { isLoggedIn } = require('../utilities/middleware');

// apply isLoggedIn to ALL routes in this router
router.use(isLoggedIn);

// INDEX & CREATE routes
router.route('/')
    .get(ingredients.index)
    .post(ingredients.createIngredient)

// NEW route
router.get('/new', ingredients.renderNewForm)

// UPDATE & DESTROY routes
router.route('/:id')
    .put(ingredients.updateIngredient)
    .delete(ingredients.destroyIngredient)

// EDIT route
router.get('/:id/edit', ingredients.renderEditForm)

// ERROR handler
router.use(ingredients.error)

module.exports = router;