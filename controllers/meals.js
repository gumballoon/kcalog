const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');
const { textCapitalize } = require('../utilities/textCapitalize'); 
// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const { tag, serving } = req.query;
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));

    // filtered index per TAG
    if (tag && allTags.includes(tag)){
        // if the TAGS array contains the passed-in tag
        const allMeals = await Meal.find({ tags: { $all: [ tag ] } })
            .catch(e => next(mongoError(e)))
        res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag, serving: "all" });

    // filtered index per SERVING
    } else if (serving && ['single', 'multi'].includes(serving)){
        const allMeals = await Meal.find({ serving })
            .catch(e => next(mongoError(e)))
        res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag: "all", serving });

    // show all
    } else {
        const allMeals = await Meal.find({})
            .catch(e => next(mongoError(e)))
        res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag: "all", serving: "all" });
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
    const { _id: id } = newMeal;

    // to (re)convert the tags list into an array
    if (newMeal.tags) {
        // the mealSchema turned the tags string into an array
        const tagsArray = newMeal.tags[0].split('+++');
        newMeal.tags = tagsArray;
    }
    await newMeal.save()
        .then(() => res.redirect(`/db/meals/${id}`))
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
        .then(() => res.redirect(`/db/meals/${id}`))
        .catch(e => next(mongoError(e)))
};

module.exports.showMeal = async (req, res, next) => {
    const { id } = req.params;

    const meal = await Meal.findById(id)
        .catch(e => next(mongoError(e)))

    res.send(meal)

    res.render('kcalog/db/meals/show', { title: textCapitalize(meal.name), meal})
};

module.exports.destroyMeal = async (req, res, next) => {
    const { id } = req.params;
    
    await Meal.findByIdAndDelete(id)
        .then(() => res.redirect(`/db/meals`))
        .catch(e => next(mongoError(e)))
};