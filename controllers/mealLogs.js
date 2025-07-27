const { Ingredient } = require('../models/ingredient');
const { Meal } = require('../models/meal');
const { MealLog } = require('../models/mealLog');
const { DailyLog } = require('../models/dailyLog');
const { getDailyLog } = require('../utilities/dailyLogs');
const { textCapitalize } = require('../utilities/textCapitalize'); 
const { serverError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const { category } = req.query;
    const allCategories = ['breakfast', 'lunch', 'snack', 'dinner'];

    // filtered index per CATEGORY
    if (category && allCategories.includes(category)) {
        let allMealLogs = await MealLog.find({ category })
            .catch(e => next(mongoError(e)));
        // order from newest to oldest
    try {
        allMealLogs = allMealLogs.sort((a,b) => b.date - a.date);
        res.render('kcalog/logs/meals/index', { title:'Meal Logs', allMealLogs, category });
    } catch (e) {
        next(serverError(e));
    }

    // show all
    } else {
        let allMealLogs = await MealLog.find({ })
            .catch(e => next(mongoError(e)));
        
        try {
            // order from newest to oldest
            allMealLogs = allMealLogs.sort((a,b) => b.date - a.date);
            res.render('kcalog/logs/meals/index', { title:'Meal Logs', allMealLogs, category: "all" });
        } catch (e) {
            next(serverError(e));
        }
    }
};

module.exports.renderNewForm = async (req, res, next) => {
    // to assign the current date as default
    const today = new Date().toISOString().split('T')[0];

    // automatically assign the Category based on the time of day
    let category = '';
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

    try {
        res.render('kcalog/logs/meals/new', { title: "New Meal Log", today, category, allMeals, allMealNames, allIngredients, allIngNames, allTags });   
    } catch (e) {
        next(serverError(e));
    }
};

module.exports.createMealLog = async (req, res, next) => {
    const { mealLog, meal } = req.body;
    const newLog = new MealLog(mealLog);
    newLog.meal = meal;

    // if it's a meal from the DB, populate MEAL w/ the stored data
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
    // create or update an existing DailyLog instance
    newLog.dailyLog = await getDailyLog('meal', newLog);

    await newLog.save()
        .then((mealLog) => {
            req.flash('success', `${textCapitalize(mealLog.meal.name)} (Log) was saved`);
            res.redirect(`/logs/meals/${newLog._id}`);
        })
        .catch(e => next(mongoError(e, 'Meal Log could not be saved')));
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    // to set the current date as max date
    const today = new Date().toISOString().split('T')[0];

    const mealLog = await MealLog.findById(id)
        .catch(e => next(mongoError(e)))
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

    try {
        res.render('kcalog/logs/meals/edit', { title:'Edit Meal Log', today, mealLog, allMeals, allMealNames, allIngredients, allIngNames, allTags });
    } catch (e) {
        next(serverError(e));
    }
};

module.exports.updateMealLog = async (req, res, next) => {
    const { id } = req.params;
    const { mealLog, meal } = req.body;
    const updatedLog = mealLog;
    updatedLog.meal = meal;

    // if it's a meal from the DB, populate MEAL w/ the stored data
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

    // if the DATE was changed, update the old DailyLog & create a new one
    const oldLog = await MealLog.findById(id)
        .catch(e => next(mongoError(e)))
    if (oldLog.date.toDateString() !== new Date(updatedLog.date).toDateString()) {
        const oldDaily = oldLog.dailyLog;
        await DailyLog.findByIdAndUpdate(oldDaily, {$pull: {mealLogs: id}}, {new:true, runValidators:true});
        updatedLog.dailyLog = await getDailyLog('meal', updatedLog);
    } else {
        updatedLog.dailyLog = oldLog.dailyLog;
    }            

    await MealLog.findByIdAndUpdate(id, updatedLog, {new:true, runValidators:true})
        .then((mealLog) => {
            req.flash('success', `${textCapitalize(mealLog.meal.name)} (Log) was updated`);
            res.redirect(`/logs/meals/${id}`);
        })
        .catch(e => next(mongoError(e, 'Meal Log could not be updated')));
};

module.exports.showMealLog = async (req, res, next) => {
    const { id } = req.params;
    await MealLog.findById(id)
        .then(mealLog => res.render('kcalog/logs/meals/show', { title: textCapitalize(mealLog.meal.name), mealLog}))
        .catch(e => next(mongoError(e, 'Meal Log not found')));
};

module.exports.destroyMealLog = async (req, res, next) => {
    const { id } = req.params;

    await MealLog.findByIdAndDelete(id)
        .then((mealLog) => {
            req.flash('success', `${textCapitalize(mealLog.meal.name)} (Log) was deleted`);
            res.redirect('/logs/meals');
        })
        .catch(e => next(mongoError(e, 'Meal Log could not be deleted')));
};

module.exports.error = (err, req, res, next) => {
    req.flash('danger', `${err.flash || 'something went wrong'}`);
    res.status(err.status).redirect('/logs/meals');
};