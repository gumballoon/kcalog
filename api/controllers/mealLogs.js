const { Ingredient } = require('../models/ingredient');
const { Meal } = require('../models/meal');
const { MealLog } = require('../models/mealLog');
const { DailyLog } = require('../models/dailyLog');
const { getDailyLog } = require('../utilities/dailyLogs');
const { textCapitalize } = require('../utilities/textCapitalize');
const { mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const userId = req.userId;
    const { category } = req.query;
    const allCategories = ['breakfast', 'lunch', 'snack', 'dinner'];
    const allMonths = await MealLog.getAllMonths(userId);

    let allMealLogs;
    let activeCategory = 'all';

    if (category && allCategories.includes(category)) {
        allMealLogs = await MealLog.find({ userId, category }).catch(e => next(mongoError(e)));
        activeCategory = category;
    } else {
        allMealLogs = await MealLog.find({ userId }).catch(e => next(mongoError(e)));
    }

    allMealLogs = allMealLogs.sort((a, b) => b.date - a.date);
    res.json({ allMealLogs, allMonths, category: activeCategory });
};

module.exports.getFormData = async (req, res, next) => {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    const hours = parseInt(new Date().toTimeString().slice(0, 2));
    let category = 'snack';
    if (hours >= 6 && hours <= 12) category = 'breakfast';
    else if (hours >= 12 && hours <= 16) category = 'lunch';
    else if (hours >= 19 && hours <= 23) category = 'dinner';

    try {
        const [allMeals, allMealNames, allIngredients, allIngNames, allTags] = await Promise.all([
            Meal.find({ userId }),
            Meal.getAllNames(userId),
            Ingredient.getFormattedIngredientData(userId),
            Ingredient.getAllNames(userId),
            Meal.getAllTags(userId),
        ]);
        res.json({ today, category, allMeals, allMealNames, allIngredients, allIngNames, allTags });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.createMealLog = async (req, res, next) => {
    const userId = req.userId;
    const { mealLog, meal } = req.body;
    const newLog = new MealLog(mealLog);
    newLog.userId = userId;
    newLog.meal = meal;
    newLog.meal.userId = userId;

    if (req.body.mealData) {
        const mealData = JSON.parse(req.body.mealData);
        if (meal.serving === 'single') {
            newLog.meal._id = mealData._id;
            newLog.meal.tags = mealData.tags;
            newLog.meal.notes = mealData.notes;
            newLog.meal.image = mealData.image;
        } else {
            newLog.meal = mealData;
        }
    }

    newLog.dailyLog = await getDailyLog('meal', newLog, next);

    await newLog.save()
        .then(mealLog => res.status(201).json({ mealLog, message: `${textCapitalize(mealLog.meal.name)} (Log) was saved` }))
        .catch(e => next(mongoError(e, 'Meal Log could not be saved')));
};

module.exports.getEditFormData = async (req, res, next) => {
    const userId = req.userId;
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    try {
        const [mealLog, allMeals, allMealNames, allIngredients, allIngNames, allTags] = await Promise.all([
            MealLog.findById(id),
            Meal.find({ userId }),
            Meal.getAllNames(userId),
            Ingredient.getFormattedIngredientData(userId),
            Ingredient.getAllNames(userId),
            Meal.getAllTags(userId),
        ]);
        res.json({ today, mealLog, allMeals, allMealNames, allIngredients, allIngNames, allTags });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.updateMealLog = async (req, res, next) => {
    const { id } = req.params;
    const { mealLog, meal } = req.body;
    const updatedLog = mealLog;
    updatedLog.meal = meal;

    if (req.body.mealData) {
        const mealData = JSON.parse(req.body.mealData);
        if (meal.serving === 'single') {
            updatedLog.meal._id = mealData._id;
            updatedLog.meal.tags = mealData.tags;
            updatedLog.meal.notes = mealData.notes;
        } else {
            updatedLog.meal = mealData;
        }
    }

    const oldLog = await MealLog.findById(id).catch(e => next(mongoError(e)));
    if (oldLog.date.toDateString() !== new Date(updatedLog.date).toDateString()) {
        await DailyLog.findByIdAndUpdate(oldLog.dailyLog, { $pull: { mealLogs: id } }, { new: true, runValidators: true });
        updatedLog.dailyLog = await getDailyLog('meal', updatedLog, next);
    } else {
        updatedLog.dailyLog = oldLog.dailyLog;
    }

    await MealLog.findByIdAndUpdate(id, updatedLog, { new: true, runValidators: true })
        .then(mealLog => res.json({ mealLog, message: `${textCapitalize(mealLog.meal.name)} (Log) was updated` }))
        .catch(e => next(mongoError(e, 'Meal Log could not be updated')));
};

module.exports.showMealLog = async (req, res, next) => {
    const { id } = req.params;
    await MealLog.findById(id)
        .then(mealLog => res.json({ mealLog }))
        .catch(e => next(mongoError(e, 'Meal Log not found')));
};

module.exports.destroyMealLog = async (req, res, next) => {
    const { id } = req.params;
    await MealLog.findByIdAndDelete(id)
        .then(mealLog => res.json({ message: `${textCapitalize(mealLog.meal.name)} (Log) was deleted` }))
        .catch(e => next(mongoError(e, 'Meal Log could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
};
