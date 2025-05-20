const mongoose = require('mongoose'); // import MONGOOSE

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
const { adjectives, terms } = require('./data/meals');

async function seedMeal(){
    await Meal.deleteMany({})
        .then(() => console.log('MEALS has been reset.'))

    const allIngredients = await Ingredient.find({});

    for (let i = 0; i < 50; i++){
        const newMeal = new Meal({
            name: `${getRandomElement(adjectives)} ${getRandomElement(terms)}`,
            image: getRandomImage(),
            notes: getRandomElement(['So tasty!', 'Love it.', 'Yummy, what a treat!']),
            serving: getRandomElement(['single', 'multi'])
        });

        if (newMeal.serving === 'multi') {
            newMeal.totalGrams = Math.round(Math.random() * 600) + 200
        }

        newMeal.ingredients = []
        for (let i = 0; i < 8; i++){
            const randomIng = getRandomElement(allIngredients);
            let ing = {};
            ing.ingredient = randomIng;
            ing.quantity = Math.round(Math.random() * 30) + 10;
            newMeal.ingredients.push(ing);
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
        if (randomMeal.serving === ''){

        }
        const newMealLog = new MealLog({
            date: getRandomDate(), 
            meal: randomMeal, 
            name: randomMeal.name,
            ingredients: randomMeal.ingredients,
            image, 
            notes
        });

        let quantity = {};
        let kcal = 0;
        if (Math.random() > 0.5){
            // random nº between 0.25-1.25 (w/ 2 decimal places)
            quantity.dosage = Math.round((Math.random() + 0.25) * 100) / 100 
            kcal = Math.round(quantity.dosage * meal.totalKcal);
            quantity.grams = Math.round(quantity.dosage * meal.totalGrams);
        } else {
            // random nº between 50-400
            quantity.grams = Math.round(Math.random() * 350) + 50
            kcal = Math.round(quantity.grams * meal.kcalPerGram);
            quantity.dosage = Math.floor(quantity.grams / meal.totalGrams * 100) / 100;
        }

        const image = getRandomImage();
        const notes = getRandomElement(['Nice meal!', "Why don't I eat this more often? I love it!", "Great post-workout meal."])


        newMealLog.dailyLog = await updateDailyLogs('meal', newMealLog);

        await newMealLog.save()
            .catch(e => console.log(e))
    }
}

// // EXERCISE LOG // //
const { ExerciseLog } = require('../models/exerciseLog');
const exercises = require('./data/exercises');

async function seedExerciseLogs(){
    await ExerciseLog.deleteMany({})
        .then(() => console.log('ExerciseLogs has been reset.'))
        .catch(e => console.log(e))

    for (let i = 0; i < 30; i++){
        const date = getRandomDate();
        const name = getRandomElement(exercises);
        const kcal = Math.floor(Math.random() * 300) + 50 // random nº between 50-350
        const minutes = getRandomElement([30, 35, 40, 45, 50, 55, 60]);
        const image = getRandomImage();
        const notes = getRandomElement(['Great workout!', 'So proud of myself!', "I should push myself a little harder next time."]);
        
        const newExercise = ExerciseLog({date, name, kcal, minutes, image, notes});
        newExercise.dailyLog = await updateDailyLogs('exercise', newExercise);

        await newExercise.save()
            .catch(e => console.log(e))
    }
}

// // // // // // //




// // // // // // //
const { DailyLog } = require('../models/dailyLog');

async function updateDailyLogs(type, log){
    const date = log.date.toDateString();
    const foundDailyLog = await DailyLog.findOne({calendarDate: date})
    let newDailyLog = '';

    if (foundDailyLog) {
        if (type === 'meal') {
            foundDailyLog.mealLogs.push(log._id);

        } else if (type === 'exercise') {
            foundDailyLog.exerciseLogs.push(log._id);
        }
        
        await foundDailyLog.save()
            .catch(e => console.log(e))
        
        return foundDailyLog;

    } else {
        if (type === 'meal') {
            newDailyLog = DailyLog({
                calendarDate: date,
                mealLogs: [log._id]
            })

        } else if (type === 'exercise') {
            newDailyLog = DailyLog({
                calendarDate: date,
                exerciseLogs: [log._id]
            })
        }
    
        await newDailyLog.save()
            .catch(e => console.log(e))
        
        return newDailyLog;
    }
}

// // // // // // //

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
    console.log(`// INGREDIENT: Random Sample //
${randomIngredient}`)

    console.log('// // // // // // //')
    
    await seedMeal()
        .then(() => console.log('MEAL has been seeded.'))
        .catch(e => console.log(e))

    const randomMeal = await Meal.findOne({});
    console.log(`// MEAL: Random Sample //
${randomMeal}
Total Grams: ${randomMeal.totalGrams}
Total Kcal: ${randomMeal.totalKcal}
Kcal Per Gram: ${randomMeal.kcalPerGram}`)
    
    console.log('// // // // // // //')
    
//     await seedMealLog()
//         .then(() => console.log('MEAL LOG has been seeded.'))
//         .catch(e => console.log(e))

//     const randomMealLog = await MealLog.findOne({});
//     console.log(`// MEAL LOG: Random Sample //
// ${randomMealLog}`);
    
//     console.log('// // // // // // //')
    
//     await seedExerciseLogs()
//         .then(() => console.log('ExerciseLogs has been seeded.'))
//         .catch(e => console.log(e))

//     const randomExerciseLog = await ExerciseLog.findOne({});
//     console.log(`// EXERCISE LOG: Random Sample //
// ${randomExerciseLog}
// Kcal Per Hour: ${randomExerciseLog.kcalPerHour}`);

//     console.log('// // // // // // //')

//     const randomDailyLog =  await DailyLog.findOne({});
//     let totalMealKcal = 0;
//     await randomDailyLog.populate('mealLogs')
//         .then(res => {
//             for (m of res.mealLogs){
//                 totalMealKcal += m.kcal;
//             }
//         })
//     let totalExerciseKcal = 0;
//     await randomDailyLog.populate('exerciseLogs')
//         .then(res => {
//             for (e of res.exerciseLogs){
//                 totalExerciseKcal += e.kcal;
//             }
//     })
        
//     console.log(`// // DAILY LOG: Random Sample // //
// ${randomDailyLog}
// Total Meal Kcal: ${totalMealKcal}
// Total Exercise Kcal: ${totalExerciseKcal}
// Daily Balance: ${totalMealKcal - totalExerciseKcal}
// }`)
}

// to close the connection to MongoDB after execution, so the terminal won't stay on hold
seedDB()
    .then(async () => {
        console.log('// // // // // // //')
        console.log('Closing Mongoose connection...')
        mongoose.connection.close()
    })
    .catch(e => console.log(e))