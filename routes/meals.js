const express = require('express');
const router = express.Router();
const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// INDEX route
router.get('/', async (req, res, next) => {
    await Meal.find({})
        .then(allMeals => res.render('kcalog/db/meals/index', { title: 'Meals', allMeals }))
        .catch(e => next(mongoError(e)))
})

// NEW route
router.get('/new', async (req, res, next) => {
    await Ingredient.find({})
        .then(allIngredients => res.render('kcalog/db/meals/new', { title: "New Meal", allIngredients }))
        .catch(e => next(mongoError(e)))
})

// CREATE route
router.post('/', async (req, res, next) => {
    const newMeal = new Meal(req.body.meal);
    newMeal.image = `https://picsum.photos/400?random=${Math.random()}`;
    for(i of newMeal.ingredients){
        const foundIng = await Ingredient.findOne({name: i.name})
            .catch(e => next(mongoError(e)))
        try {
            i.ingredient = foundIng;
            i.kcal = Math.round(i.grams * foundIng.kcalPerGram);
        } catch (e) {
            next(new AppError('Ingredient Not Found', 400, e.message))
        }
    }
    const { _id: id } = newMeal;
    await newMeal.save()
        .then(() => res.redirect(`/kcalog/db/meals/${id}`))
        .catch(e => next(mongoError(e)))
})

// EDIT route
router.get('/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    const allIngredients = await Ingredient.find({});
    await Meal.findById(id).populate('ingredients')
        .then(meal => res.render('kcalog/db/meals/edit', { title: 'Edit Meal', meal, allIngredients }))
        .catch(e => next(mongoError(e)))
})

// UPDATE route
router.put('/:id', async (req, res, next) => {
    const updatedMeal = req.body.meal;
    for(i of updatedMeal.ingredients){
        const foundIng = await Ingredient.findOne({name: i.name})
            .catch(e => next(mongoError(e)))
        try {
            i.ingredient = foundIng;
            i.kcal = Math.round(i.grams * foundIng.kcalPerGram);
        } catch (e) {
            next(new AppError('Ingredient Not Found', 400, e.message))
        }
    }
    const { id } = req.params;
    await Meal.findByIdAndUpdate(id, updatedMeal, {runValidators:true})
        .then(() => res.redirect(`/kcalog/db/meals/${id}`))
        .catch(e => next(mongoError(e)))
})

// SHOW route
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    await Meal.findById(id).populate('ingredients')
        .then(meal => res.render('kcalog/db/meals/show', { title: meal.name, meal}))
        .catch(e => next(mongoError(e)))
})

// DESTROY route
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id)
        .then(() => res.redirect(`/kcalog/db/meals`))
        .catch(e => next(mongoError(e)))
})

module.exports = router;