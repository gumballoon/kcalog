const mongoose = require('mongoose'); // import MONGOOSE
mongoose.set('strictQuery', true); // to surpress a Mongoose 7 warning
// to connect to a specific database
mongoose.connect('mongodb://127.0.0.1:27017/kcalog')
    .then(() => {
        console.log("Connection: Open")
    })
    .catch(err => {
        console.log("Connection: Error")
        console.log(err)
    })

// Utilties //
function getRandomElement(arr){
    const randomIndex = Math.floor(Math.random() * arr.length)
    return arr[randomIndex];
}

// to get a random 400x400 image from Lorem Picsum
function getRandomImage(){
    return `https://picsum.photos/400?random=${Math.random()}`;
}

// to a random date from January 2025
function getRandomDate(){
    const day = Math.floor(Math.random() * 31) + 1; // random number between 1-31
    return new Date(`2025-01-${day}`);
}

const { DailyLog } = require('../models/dailyLog');
// to create or update a Daily Log 
const { updateDailyLogs } = require('../utilities/dailyLogs');

// // INGREDIENT // //
const { Ingredient } = require('../models/ingredient');
const ingredients = require('./data/ingredients');

async function seedIngredient(){
    await Ingredient.deleteMany({})
        .then(() => console.log('INGREDIENTS has been reset.'))

    await Ingredient.insertMany(ingredients)
        .catch(e => console.log(e))     
}

// // MEAL // //
const { Meal } = require('../models/meal');
const { adjectives, terms, tags } = require('./data/meals');

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
            newMeal.ingredients.push(randomIng);
        }

        await newMeal.save()
            .catch(e => console.log(e))
    }
}

// // MEAL LOG // // 
const { MealLog } = require('../models/mealLog');

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

        newMealLog.dailyLog = await updateDailyLogs('meal', newMealLog);

        await newMealLog.save()
            .catch(e => console.log(e))
    }
}

// // WORKOUT LOG // //
const { WorkoutLog } = require('../models/workoutLog');
const workouts = require('./data/workouts');

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

        newWorkoutLog.dailyLog = await updateDailyLogs('workout', newWorkoutLog);

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

//     const randomDailyLog =  await DailyLog.findOne({});
//     let totalMealKcal = 0;
//     await randomDailyLog.populate('mealLogs')
//         .then(res => {
//             for (m of res.mealLogs){
//                 totalMealKcal += m.kcal;
//             }
//         })
//     let totalworkoutKcal = 0;
//     await randomDailyLog.populate('workoutLogs')
//         .then(res => {
//             for (e of res.workoutLogs){
//                 totalworkoutKcal += e.kcal;
//             }
//     })
        
//     console.log(`// // DAILY LOG: Random Sample // //
// ${randomDailyLog}
// Total Meal Kcal: ${totalMealKcal}
// Total workout Kcal: ${totalworkoutKcal}
// Daily Balance: ${totalMealKcal - totalworkoutKcal}
// console.log('// // // // // // //')
// }`)
}

// to close the connection to MongoDB after execution, so the terminal won't stay on hold
seedDB()
    .then(async () => {
        console.log('Closing Mongoose connection...')
        mongoose.connection.close()
    })
    .catch(e => console.log(e))