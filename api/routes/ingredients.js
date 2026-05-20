const express = require('express');
const router = express.Router();
const ingredients = require('../controllers/ingredients');
const { verifyToken } = require('../utilities/auth');

router.use(verifyToken);

router.route('/')
    .get(ingredients.index)
    .post(ingredients.createIngredient);

router.get('/form-data', ingredients.getFormData);

router.route('/:id')
    .put(ingredients.updateIngredient)
    .delete(ingredients.destroyIngredient);

router.get('/:id/form-data', ingredients.getEditFormData);

router.use(ingredients.error);

module.exports = router;
