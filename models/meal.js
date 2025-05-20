const mongoose = require('mongoose'); // import MONGOOSE
const { Ingredient } = require('./ingredient');
const { Schema } = mongoose;

const mealSchema = new Schema({
    name: {
        type: String,
        lowcase: true,
        unique: true,
        required: [true, 'NAME cannot be blank']
    },
    ingredients: [ {
        _id: {_id: false},
        ingredient: {
            type: Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        quantity: {
            type: Number,
            required: [true, 'Ingredients: QUANTITY cannot be blank']
        },
        kcal: Number
    } ],
    serving: {
        type: String,
        lowercase: true,
        enum: ['single', 'multi'],
        required: [true, 'SERVING cannot be blank']
    },
    totalGrams: Number,
    tags: [ String ],
    notes: String,
    image: String
})

mealSchema.pre('save', async function() {
    for (let i of this.ingredients) {
        if (!i.kcal) {
            const ing = await Ingredient.findById(i.ingredient);
            i.kcal = Math.round(i.quantity * ing.kcalPerUnit);
        }
    }
})

mealSchema.virtual('totalKcal').get(function(){
    let totalKcal = 0;
    for (let i of this.ingredients){
        totalKcal += i.kcal;
    }
    return Math.round(totalKcal);
})

mealSchema.virtual('kcalPerGram').get(function(){
    return Math.round(this.totalKcal / this.totalGrams * 100) / 100;
})

module.exports.mealSchema = mealSchema;
module.exports.Meal = mongoose.model('Meal', mealSchema);;