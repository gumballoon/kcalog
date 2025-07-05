const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');
const { capitalize } = require('../utilities/capitalize'); 

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

module.exports.index = async (req, res, next) => {
    const { tag, serving } = req.query;
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));
    if (tag && allTags.includes(tag)){
        // if the TAGS array contain the passed-in tag
        await Meal.find({ tags: { $all: [ tag ] } })
            .then(allMeals => res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag, serving: "all" }))
            .catch(e => next(mongoError(e)))
    } else if (serving && ['single', 'multi'].includes(serving)){
        await Meal.find({ serving })
            .then(allMeals => res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag: "all", serving }))
            .catch(e => next(mongoError(e)))
    } else {
        await Meal.find({})
            .then(allMeals => res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag: "all", serving: "all" }))
            .catch(e => next(mongoError(e)))
    }
};

module.exports.renderNewForm = async (req, res, next) => {
    const allIngredients = await Ingredient.getFormattedIngredientData()
        .catch(e => next(mongoError(e)));
    const allIngNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allMealNames = await Meal.getAllNames()
        .catch(e => next(mongoError(e)));
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));
    res.render('kcalog/db/meals/new', { title: "New Meal", allIngredients, allIngNames, allMealNames, allTags })
};

module.exports.createMeal = async (req, res, next) => {
    const newMeal = new Meal(req.body.meal);
    // to (re)convert the tags list into an array
    if (newMeal.tags) {
        const tagsArray = newMeal.tags[0].split('+++');
        newMeal.tags = tagsArray;
    }
    newMeal.image = '/images/default-meal.svg';
    const { _id: id } = newMeal;
    await newMeal.save()
        .then(() => res.redirect(`/kcalog/db/meals/${id}`))
        .catch(e => next(mongoError(e)))
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const allIngredients = await Ingredient.getFormattedIngredientData()
        .catch(e => next(mongoError(e)));
    const allIngNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allMealNames = await Meal.getAllNames()
        .catch(e => next(mongoError(e)));
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));
    const meal = await Meal.findById(id).populate('ingredients')
        .catch(e => next(mongoError(e)));
    res.render('kcalog/db/meals/edit', { title: 'Edit Meal', meal, allIngredients, allIngNames, allMealNames, allTags })
};

module.exports.updateMeal = async (req, res, next) => {
    const { id } = req.params;
    const updatedMeal = req.body.meal;
    // to (re)convert the tags list into an array
    if (updatedMeal.tags) {
        const tagsArray = updatedMeal.tags.split('+++');
        updatedMeal.tags = tagsArray;
    }
    await Meal.findByIdAndUpdate(id, updatedMeal, {runValidators:true})
        .then(() => res.redirect(`/kcalog/db/meals/${id}`))
        .catch(e => next(mongoError(e)))
};

module.exports.showMeal = async (req, res, next) => {
    const { id } = req.params;
    const meal = await Meal.findById(id)
        .catch(e => next(mongoError(e)))
    console.log(meal)
    res.render('kcalog/db/meals/show', { title: capitalize(meal.name), meal})
};

module.exports.destroyMeal = async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id)
        .then(() => res.redirect(`/kcalog/db/meals`))
        .catch(e => next(mongoError(e)))
};