const mongoose = require('mongoose');
// surpress a Mongoose 7 warning
mongoose.set('strictQuery', true);
// production DB vs. development DB
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/kcalog'
// connect to a specific db
mongoose.connect(dbURL)
    .then(() => {
        console.log("Connection: Open")
    })
    .catch(err => {
        console.log("Connection: Error")
        console.log(err)
})

const { DailyLog } = require('../models/dailyLog');
const { getDailyLog } = require('../utilities/dailyLogs');
const { Ingredient } = require('../models/ingredient');
const ingredients = require('./data/ingredients');
const { Meal } = require('../models/meal');
const { adjectives, terms, tags } = require('./data/meals');
const { MealLog } = require('../models/mealLog');
const { WorkoutLog } = require('../models/workoutLog');
const workouts = require('./data/workouts');

function getRandomElement(arr){
    const randomIndex = Math.floor(Math.random() * arr.length)
    return arr[randomIndex];
}

// to get a random date from January 2025
function getRandomDate(){
    const day = Math.floor(Math.random() * 31) + 1; // random number between 1-31
    return new Date(`2025-01-${day}`);
}

async function seedIngredient(){
    await Ingredient.deleteMany({})
        .then(() => console.log('INGREDIENTS has been reset.'))

    await Ingredient.insertMany(ingredients)
        .catch(e => console.log(e))     
}

async function seedMeal(){
    await Meal.deleteMany({})
        .then(() => console.log('MEALS has been reset.'))

    const allIngredients = await Ingredient.find({});

    for (let i = 0; i < 15; i++){
        const newMeal = new Meal({
            name: `${getRandomElement(adjectives)} ${getRandomElement(terms)}`,
            image: '/images/default-meal.svg',
            notes: getRandomElement(['So tasty!', 'Love it.', 'Yummy, what a treat!']),
            tags: [getRandomElement(tags), getRandomElement(tags)],
            serving: getRandomElement(['single', 'full'])
        });

        if (newMeal.serving === 'full') {
            newMeal.totalGrams = Math.round(Math.random() * 600) + 200;
        }

        newMeal.ingredients = []
        for (let i = 0; i < 6; i++){
            // to add a copy of a Mongo doc WITHOUT the schema validation (so it won't block new properties)
            const randomIng = getRandomElement(allIngredients).toObject();
            randomIng.quantity = Math.round(Math.random() * 30) + 10;
            randomIng.kcal = Math.round(randomIng.quantity * randomIng.kcalPerUnit);
            newMeal.ingredients.push(randomIng);
        }

        await newMeal.save()
            .catch(e => console.log(e))
    }
}

async function seedMealLog(){
    await MealLog.deleteMany({})
    .then(() => console.log('MEAL LOG has been reset.'))

    const allMeals = await Meal.find({});

    // 60 random logs
    for (let i = 0; i < 60; i++){
        const randomMeal = getRandomElement(allMeals);
        const newMealLog = new MealLog({
            date: getRandomDate(), 
            category: getRandomElement(['breakfast', 'lunch', 'snack', 'dinner']),
            meal: randomMeal,
            image: '/images/default-mealLog.svg',
            notes: getRandomElement(['Nice meal!', "Why don't I eat this more often? I love it!", "Great post-workout meal."]),
        });

        if (newMealLog.meal.serving === 'full') {
            newMealLog.grams = Math.round(Math.random() * 25) + 500;
        }
        
        // create or update an existing DailyLog instance
        newMealLog.dailyLog = await getDailyLog('meal', newMealLog);

        await newMealLog.save()
            .catch(e => console.log(e))
    }
}

async function seedWorkoutLogs(){
    await WorkoutLog.deleteMany({})
        .then(() => console.log('WORKOUT LOG has been reset.'))
        .catch(e => console.log(e))

    for (let i = 0; i < 30; i++){
        const newWorkoutLog = new WorkoutLog({
            date: getRandomDate(),
            name: getRandomElement(workouts),
            kcal: Math.floor(Math.random() * 300) + 50, // random nº between 50-350
            duration: getRandomElement(['00:15', '00:30', '00:45', '01:00', '01:15', '01:30']),
            image: '/images/default-workoutLog.svg',
            notes: getRandomElement(['Great workout!', 'So proud of myself!', "I should push myself a little harder next time."])
        });

        // create or update an existing DailyLog instance
        newWorkoutLog.dailyLog = await getDailyLog('workout', newWorkoutLog);

        await newWorkoutLog.save()
            .catch(e => console.log(e))
    }
}


// to reset DailyLogs & execute all seed functions
async function seedDB(){
    await DailyLog.deleteMany({})
        .then(() => console.log('DAILY LOG has been reset.'))
        .catch(e => console.log(e))
    console.log('// // // // // // //')
    
    await seedIngredient()
        .then(() => console.log('INGREDIENT has been seeded.'))
        .catch(e => console.log(e))
    const randomIngredient = await Ingredient.findOne({});
    console.log(`// INGREDIENT: Random Sample // ${randomIngredient}`)
    console.log('// // // // // // //')
    
    await seedMeal()
        .then(() => console.log('MEAL has been seeded.'))
        .catch(e => console.log(e))
    const randomMeal = await Meal.findOne({});
    console.log(`// MEAL: Random Sample // ${randomMeal} // Total Kcal: ${randomMeal.totalKcal} // Kcal Per Gram: ${randomMeal.kcalPerGram}`)
    console.log('// // // // // // //')
    
    await seedMealLog()
        .then(() => console.log('MEAL LOG has been seeded.'))
        .catch(e => console.log(e))
    const randomMealLog = await MealLog.findOne({});
    console.log(`// MEAL LOG: Random Sample // ${randomMealLog}`);
    console.log('// // // // // // //')
    
    await seedWorkoutLogs()
        .then(() => console.log('WORKOUT LOG has been seeded.'))
        .catch(e => console.log(e))
    const randomWorkoutLog = await WorkoutLog.findOne({});
    console.log(`// WORKOUT LOG: Random Sample // ${randomWorkoutLog} // Kcal Per Hour: ${randomWorkoutLog.kcalPerHour}`);
    console.log('// // // // // // //')
}

// to close the connection to MongoDB after execution, so the terminal won't stay on hold
seedDB()
    .then(async () => {
        console.log('Closing Mongoose connection...')
        mongoose.connection.close()
    })
    .catch(e => console.log(e))