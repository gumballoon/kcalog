const { required } = require('joi');
const mongoose = require('mongoose'); // import MONGOOSE

mongoose.connect('mongodb://127.0.0.1:27017/kcalog') // to connect to a specific database
    .then(() => {
        console.log("Connection: Open")
    })
    .catch(err => {
        console.log("Connection: Error")
        console.log(err)
    })

const { Schema } = mongoose;

// // // // // // // // // // // // // // // //

const mealSchema = new Schema({
    name: {
        type: String,
        required: [true, 'NAME cannot be blank'],
        lowcase: true
    },
    ingredients: [ {
        _id: {_id: false},
        meal: {
            type: Schema.Types.ObjectId,
            ref: 'Ingredient'
            // not required since it can be deleted afterwards
        },
        name: {
            type: String,
            required: [true, 'Ingredients: NAME cannot be blank']
        },
        grams: {
            type: Number,
            required: [true, 'Ingredients: GRAM cannot be blank']
        },
        kcal: {
            type: Number,
            required: [true, 'Ingredients: KCAL cannot be blank']
        }
    } ],
    image: String,
    notes: String
})

mealSchema.virtual('totalGrams').get(function(){
    let totalGrams = 0;
    for (let i of this.ingredients){
        totalGrams += i.grams;
    }
    return totalGrams;
})

mealSchema.virtual('totalKcal').get(function(){
    let totalKcal = 0;
    for (i of this.ingredients){
        totalKcal += i.kcal;
    }
    return Math.round(totalKcal);
})

mealSchema.virtual('kcalPerGram').get(function(){
    return Math.round(this.totalKcal / this.totalGrams * 100) / 100;
})

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;