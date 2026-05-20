const express = require('express');
const router = express.Router();
const meals = require('../controllers/meals');
const { verifyToken } = require('../utilities/auth');

router.use(verifyToken);

router.route('/')
    .get(meals.index)
    .post(meals.createMeal);

// form-data must come before /:id to avoid route conflict
router.get('/form-data', meals.getFormData);

router.route('/:id')
    .get(meals.showMeal)
    .put(meals.updateMeal)
    .delete(meals.destroyMeal);

router.get('/:id/form-data', meals.getEditFormData);

router.use(meals.error);

module.exports = router;
