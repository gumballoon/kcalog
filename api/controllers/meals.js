const { Meal } = require('../models/meal');
const { Ingredient } = require('../models/ingredient');
const { orderByName } = require('../utilities/orderByName');
const { textCapitalize } = require('../utilities/textCapitalize');
const { mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const userId = req.userId;
    const { tag, serving } = req.query;
    const allTags = await Meal.getAllTags(userId).catch(e => next(mongoError(e)));

    let meals;
    let activeTag = 'all';
    let activeServing = 'all';

    if (tag && allTags.includes(tag)) {
        meals = await Meal.find({ userId, tags: { $all: [tag] } }).catch(e => next(mongoError(e)));
        activeTag = tag;
    } else if (serving && ['single', 'full'].includes(serving)) {
        meals = await Meal.find({ userId, serving }).catch(e => next(mongoError(e)));
        activeServing = serving;
    } else {
        meals = await Meal.find({ userId }).catch(e => next(mongoError(e)));
    }

    res.json({ allMeals: orderByName(meals), allTags, tag: activeTag, serving: activeServing });
};

module.exports.getFormData = async (req, res, next) => {
    const userId = req.userId;
    try {
        const [allIngredients, allIngNames, allMealNames, allTags] = await Promise.all([
            Ingredient.getFormattedIngredientData(userId),
            Ingredient.getAllNames(userId),
            Meal.getAllNames(userId),
            Meal.getAllTags(userId),
        ]);
        res.json({ allIngredients, allIngNames, allMealNames, allTags });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.createMeal = async (req, res, next) => {
    const userId = req.userId;
    const newMeal = new Meal(req.body.meal);
    newMeal.userId = userId;

    if (newMeal.tags) {
        newMeal.tags = newMeal.tags[0].split('+++');
    }

    await newMeal.save()
        .then(meal => res.status(201).json({ meal, message: `${textCapitalize(meal.name)} was saved` }))
        .catch(e => next(mongoError(e, 'Meal could not be saved')));
};

module.exports.getEditFormData = async (req, res, next) => {
    const userId = req.userId;
    const { id } = req.params;
    try {
        const [allIngredients, allIngNames, allMealNames, allTags, meal] = await Promise.all([
            Ingredient.getFormattedIngredientData(userId),
            Ingredient.getAllNames(userId),
            Meal.getAllNames(userId),
            Meal.getAllTags(userId),
            Meal.findById(id).populate('ingredients'),
        ]);
        res.json({ meal, allIngredients, allIngNames, allMealNames, allTags });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.updateMeal = async (req, res, next) => {
    const { id } = req.params;
    const updatedMeal = req.body.meal;

    if (updatedMeal.tags) {
        updatedMeal.tags = updatedMeal.tags.split('+++');
    }

    await Meal.findByIdAndUpdate(id, updatedMeal, { new: true, runValidators: true })
        .then(meal => res.json({ meal, message: `${textCapitalize(meal.name)} was updated` }))
        .catch(e => next(mongoError(e, 'Meal could not be updated')));
};

module.exports.showMeal = async (req, res, next) => {
    const { id } = req.params;
    await Meal.findById(id)
        .then(meal => res.json({ meal }))
        .catch(e => next(mongoError(e, 'Meal not found')));
};

module.exports.destroyMeal = async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id)
        .then(meal => res.json({ message: `${textCapitalize(meal.name)} was deleted` }))
        .catch(e => next(mongoError(e, 'Meal could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
};
