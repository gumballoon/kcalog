const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');
const { orderByName } = require('../utilities/orderByName');
const { textCapitalize } = require('../utilities/textCapitalize'); 
const { serverError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const { tag, serving } = req.query;
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));

    // filtered index per TAG
    if (tag && allTags.includes(tag)){
        // if the TAGS array contains the passed-in tag
        const meals = await Meal.find({ tags: { $all: [ tag ] } })
            .catch(e => next(mongoError(e)));

        const allMeals = orderByName(meals);
        
        try {
            res.render('kcalog/db/meals/index', { title:'Meals', allMeals, allTags, tag, serving: "all" });
        } catch(e) {
            next(serverError(e));
        }

    // filtered index per SERVING
    } else if (serving && ['single', 'multi'].includes(serving)){
        const meals = await Meal.find({ serving })
            .catch(e => next(mongoError(e)));

        const allMeals = orderByName(meals);

        try {
            res.render('kcalog/db/meals/index', { title:'Meals', allMeals, allTags, tag: "all", serving });
        } catch(e) {
            next(serverError(e));
        }

    // show all
    } else {
        const meals = await Meal.find({})
            .catch(e => next(mongoError(e)));

        const allMeals = orderByName(meals);
        
        try {
            res.render('kcalog/db/meals/index', { title:'Meals', allMeals, allTags, tag: "all", serving: "all" });
        } catch(e) {
            next(serverError(e));
        }
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

    try {
        res.render('kcalog/db/meals/new', { title: "New Meal", allIngredients, allIngNames, allMealNames, allTags })
    } catch(e) {
        next(serverError(e));
    }
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
        .then(meal => {
            req.flash('success', `${textCapitalize(meal.name)} was saved`);
            res.redirect(`/db/meals/${id}`);
        })
        .catch(e => next(mongoError(e, 'Meal could not be saved')));
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

    try {
        res.render('kcalog/db/meals/edit', { title: 'Edit Meal', meal, allIngredients, allIngNames, allMealNames, allTags });
    } catch(e) {
        next(serverError(e));
    }
    
};

module.exports.updateMeal = async (req, res, next) => {
    const { id } = req.params;
    const updatedMeal = req.body.meal;

    // to (re)convert the tags list into an array
    if (updatedMeal.tags) {
        const tagsArray = updatedMeal.tags.split('+++');
        updatedMeal.tags = tagsArray;
    }

    await Meal.findByIdAndUpdate(id, updatedMeal, {new:true, runValidators:true})
        .then(meal => {
            req.flash('success', `${textCapitalize(meal.name)} was updated`);
            res.redirect(`/db/meals/${id}`);
        })
        .catch(e => next(mongoError(e, 'Meal could not be updated')));
};

module.exports.showMeal = async (req, res, next) => {
    const { id } = req.params;

    await Meal.findById(id)
        .then(meal => res.render('kcalog/db/meals/show', { title: textCapitalize(meal.name), meal}))
        .catch(e => next(mongoError(e, 'Meal not found')));
};

module.exports.destroyMeal = async (req, res, next) => {
    const { id } = req.params;
    
    await Meal.findByIdAndDelete(id)
        .then((meal) => {
            req.flash('success', `${textCapitalize(meal.name)} was deleted`);
            res.redirect('/db/meals');
        })
        .catch(e => next(mongoError(e, 'Meal could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    req.flash('danger', `${err.flash || 'something went wrong'}`);
    console.log(err);
    res.status(err.status).redirect('/db/meals');
};