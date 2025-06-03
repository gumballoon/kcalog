const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');

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
    }else {
        await Meal.find({})
            .then(allMeals => res.render('kcalog/db/meals/index', { title:'Meals', allMeals, tag: "all", serving: "all" }))
            .catch(e => next(mongoError(e)))
    }
}

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
}

module.exports.createMeal = async (req, res, next) => {
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
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const allIngredients = await Ingredient.find({});
    await Meal.findById(id).populate('ingredients')
        .then(meal => res.render('kcalog/db/meals/edit', { title: 'Edit Meal', meal, allIngredients }))
        .catch(e => next(mongoError(e)))
}

module.exports.updateMeal = async (req, res, next) => {
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
}

module.exports.showMeal = async (req, res, next) => {
    const { id } = req.params;
    const foundMeal = await Meal.findById(id)
        .catch(e => next(mongoError(e)))
    console.log(foundMeal)
    res.render('kcalog/db/meals/show', { title: foundMeal.name, foundMeal})
}

module.exports.destroyMeal = async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id)
        .then(() => res.redirect(`/kcalog/db/meals`))
        .catch(e => next(mongoError(e)))
}