const { Ingredient } = require('../models/ingredient');
const { Meal } = require('../models/meal');
const { MealLog } = require('../models/mealLog');
const { DailyLog } = require('../models/dailyLog');
const { capitalize } = require('../utilities/capitalize'); 

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError');
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
};

// to create or update a Daily Log 
const { updateDailyLogs } = require('../utilities/dailyLogs')

module.exports.index = async (req, res, next) => {
    const { category } = req.query;
    const allCategories = ['breakfast', 'lunch', 'snack', 'dinner'];
    if (category && allCategories.includes(category)) {
        let allMealLogs = await MealLog.find({ category })
            .catch(e => next(mongoError(e)));
        // to order from newest to oldest
        allMealLogs = allMealLogs.sort((a,b) => b.date - a.date);
        res.render('kcalog/logs/meals/index', { title:'Meal Logs', allMealLogs, category })
    } else {
        let allMealLogs = await MealLog.find({ })
        .catch(e => next(mongoError(e)));
        // to order from newest to oldest
        allMealLogs = allMealLogs.sort((a,b) => b.date - a.date);
        res.render('kcalog/logs/meals/index', { title:'Meal Logs', allMealLogs, category: "all" })
    }
};

module.exports.renderNewForm = async (req, res, next) => {
    // to assign the current date as default
    const today = new Date().toISOString().split('T')[0];

    // to automatically assign the Category based on the time of day
    let category = ''
    const hours = parseInt(new Date().toTimeString().slice(0,2)); // 00 to 23
    if (hours >= 6 && hours <= 12) {
        category = 'breakfast';
    } else if (hours >= 12 && hours <= 16) {
        category = 'lunch';
    } else if (hours >= 19 && hours <= 23) {
        category = 'dinner';
    } else {
        category = 'snack';
    }

    const allMeals = await Meal.find({ })
        .catch(e => next(mongoError(e)));
    const allMealNames = await Meal.getAllNames()
        .catch(e => next(mongoError(e)));
    const allIngredients = await Ingredient.getFormattedIngredientData()
        .catch(e => next(mongoError(e)));
    const allIngNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));

    res.render('kcalog/logs/meals/new', { title: "New Meal Log", today, category, allMeals, allMealNames, allIngredients, allIngNames, allTags })
};

module.exports.createMealLog = async (req, res, next) => {
    const newLog = new MealLog(req.body.mealLog);
    newLog.meal = req.body.meal;
    newLog.image = `https://picsum.photos/400?random=${Math.random()}`;
    newLog.dailyLog = await updateDailyLogs('meal', newLog);
    await newLog.save()
        .then(() => res.redirect(`/kcalog/logs/meals/${newLog._id}`))
        .catch(e => next(mongoError(e)));
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const mealLog = await MealLog.findById(id)
        .catch(e => next(mongoError(e)))
    const allIngredients = await Ingredient.getFormattedIngredientData()
        .catch(e => next(mongoError(e)));
    const allIngNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allMealNames = await Meal.getAllNames()
        .catch(e => next(mongoError(e)));
    const allTags = await Meal.getAllTags()
        .catch(e => next(mongoError(e)));
    res.render('kcalog/logs/meals/edit', { title:'Edit Meal Log', mealLog, allIngredients, allIngNames, allMealNames, allTags })

};

module.exports.updateMealLog = async (req, res, next) => {
    const updatedLog = req.body.mealLog;
    updatedLog.meal = await Meal.findOne({ name: updatedLog.name })
        .catch(e => next(mongoError(e)));
    if (updatedLog.meal) {
        updatedLog.kcal = 0;
        if (updatedLog.quantity.dosage) {
            updatedLog.kcal = Math.round(updatedLog.quantity.dosage * updatedLog.meal.totalKcal);
            updatedLog.quantity.grams = Math.round(updatedLog.quantity.dosage * updatedLog.meal.totalGrams);
        } else if (updatedLog.quantity.grams) {
            updatedLog.kcal = Math.round(updatedLog.quantity.grams * updatedLog.meal.kcalPerGram);
            updatedLog.quantity.dosage = Math.floor(updatedLog.quantity.grams / updatedLog.meal.totalGrams * 100) / 100;
        }
    } else {
        next(new AppError('Meal Not Found', 400, e.message));
    }
    const { id } = req.params;
    await MealLog.findByIdAndUpdate(id, updatedLog, {runValidators:true}) 
        .then(() => res.redirect(`/kcalog/logs/meals/${id}`))
        .catch(e => next(mongoError(e)));
}

module.exports.showMealLog = async (req, res, next) => {
    const { id } = req.params;
    await MealLog.findById(id)
        .then(mealLog => res.render('kcalog/logs/meals/show', { title: capitalize(mealLog.meal.name), mealLog}))
        .catch(e => next(mongoError(e)))
};

module.exports.destroyMealLog = async (req, res, next) => {
    const { id } = req.params;
    const deletedLog = await MealLog.findByIdAndDelete(id)
        .catch(e => next(mongoError(e)))

    // to update the associated DailyLog
    const dailyId = deletedLog.dailyLog;
    const updatedLog = await DailyLog.findByIdAndUpdate(dailyId, {$pull: {mealLogs: deletedLog._id}}, {new:true, runValidators:true})
        .catch(e => next(mongoError(e)))
    // to delete the associated DailyLog if it's empty (no Meal/Workout logs)
    if (!updatedLog.mealLogs.length && !updatedLog.workoutLogs.length) {
        await DailyLog.findByIdAndDelete(dailyId);
    }
    res.redirect('/kcalog/logs/meals');
};