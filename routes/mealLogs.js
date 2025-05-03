const express = require('express');
const router = express.Router();
const MealLog = require('../models/mealLog');
const Meal = require('../models/meal');
const DailyLog = require('../models/dailyLog');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError');
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
} 

// to add a new DailyLog or update one
const updateDailyLogs = require('../utilities/updateDailyLogs')

// // // // // // // //

// INDEX route
router.get('/', async (req, res, next) => {
    let allMealLogs = await MealLog.find({})
        .catch(e => next(mongoError(e)));
    // order from most recent to oldest
    allMealLogs = allMealLogs.sort((a,b) => b.date - a.date);
    res.render('kcalog/logs/meals/index', { title:'Meal Logs', allMealLogs })
})

// NEW route
router.get('/new', async (req, res, next) => {
    const today = new Date().toISOString().split('T')[0];
    await Meal.find({})
        .then(allMeals => res.render('kcalog/logs/meals/new', { title: "New Meal Log", allMeals, today }))
        .catch(e => next(mongoError(e)))
})

// CREATE route
router.post('/', async (req, res, next) => {
    const newLog = new MealLog(req.body.mealLog);
    newLog.meal = await Meal.findOne({ name: newLog.name })
        .catch(e => next(mongoError(e)));
    if (newLog.meal) {
        newLog.kcal = 0;
        if (newLog.quantity.dosage) {
            newLog.kcal = Math.round(newLog.quantity.dosage * newLog.meal.totalKcal);
            newLog.quantity.grams = Math.round(newLog.quantity.dosage * newLog.meal.totalGrams);
        } else if (newLog.quantity.grams) {
            newLog.kcal = Math.round(newLog.quantity.grams * newLog.meal.kcalPerGram);
            newLog.quantity.dosage = Math.floor(newLog.quantity.grams / newLog.meal.totalGrams * 100) / 100;
        }
    } else {
        next(new AppError('Meal Not Found', 400, e.message));
    }
    newLog.image = `https://picsum.photos/400?random=${Math.random()}`;
    newLog.dailyLog = await updateDailyLogs('meal', newLog);

    await newLog.save()
        .then(() => res.redirect(`/kcalog/logs/meals/${newLog._id}`))
        .catch(e => next(mongoError(e)));
    
    console.log(newLog)
})

// EDIT route
router.get('/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    const allMeals = await Meal.find({})
        .catch(e => next(mongoError(e)))
    await MealLog.findById(id)
        .then(mealLog => res.render('kcalog/logs/meals/edit', { title:'Edit Meal Log', mealLog, allMeals }))
        .catch(e => next(mongoError(e)))
})

// UPDATE route
router.put('/:id', async (req, res, next) => {
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
})

// SHOW route
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    await MealLog.findById(id)
        .then(mealLog => res.render('kcalog/logs/meals/show', { title: mealLog.name, mealLog}))
        .catch(e => next(mongoError(e)))
})

// DESTROY route
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    const deletedLog = await MealLog.findByIdAndDelete(id)
        .catch(e => next(mongoError(e)))

    // to update the associated DailyLog
    const dailyId = deletedLog.dailyLog;
    const updatedLog = await DailyLog.findByIdAndUpdate(dailyId, {$pull: {mealLogs: deletedLog._id}}, {new:true, runValidators:true})
        .catch(e => next(mongoError(e)))
    // to delete the associated DailyLog if it's empty (no Meal or Exercise logs)
    if (!updatedLog.mealLogs.length && !updatedLog.exerciseLogs.length) {
        await DailyLog.findByIdAndDelete(dailyId);
    }
    res.redirect('/kcalog/logs/meals');
})

module.exports = router;