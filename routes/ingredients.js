const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// INDEX route
router.get('/', async (req, res, next) => {
    const { category } = req.query;
    const allCategories = await Ingredient.getAllCategories();
    if (category && allCategories.includes(category)){
        await Ingredient.find({ category })
            .then(allIngredients => res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category }))
            .catch(e => next(mongoError(e)))   
    } else {
        await Ingredient.find({})
            .then(allIngredients => res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category: "all" }))
            .catch(e => next(mongoError(e)))
    }
})

// NEW route
router.get('/new', async (req, res, next) => {
    await Ingredient.getAllCategories()
        .then(allCategories => res.render('kcalog/db/ingredients/new', { title: "New Ingredient", allCategories }))
        .catch(e => next(mongoError(e)))
})

// CREATE route
router.post('/', async (req, res, next) => {
    const newIng = new Ingredient(req.body.ingredient);
    const { _id: id } = newIng;
    await newIng.save()
        .then(() => res.redirect(`/kcalog/db/ingredients/${id}`))
        .catch(e => next(mongoError(e)))
})

// EDIT route
router.get('/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    const allCategories = await Ingredient.getAllCategories();
    await Ingredient.findById(id)
        .then(ingredient => res.render('kcalog/db/ingredients/edit', { title: 'Edit Ingredient', ingredient, allCategories }))
        .catch(e => next(mongoError(e)))
})

// UPDATE route
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndUpdate(id, req.body.ingredient, {runValidators:true})
        .then(() => res.redirect(`/kcalog/db/ingredients/${id}`))
        .catch(e => next(mongoError(e)))
})

// SHOW route
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findById(id)
        .then(ingredient => res.render('kcalog/db/ingredients/show', { title: ingredient.name, ingredient}))
        .catch(e => next(mongoError(e)))
})

// DESTROY route
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndDelete(id)
        .then(() => res.redirect(`/kcalog/db/ingredients`))
        .catch(e => next(mongoError(e)))
})

module.exports = router;