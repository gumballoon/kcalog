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
    totalKcal: Number,
    totalGrams: {
        type: Number,
        required: [function () {
          return this.serving === 'multi';
        }, 'TOTAL GRAMS is required when SERVING is multi']
    },
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

mealSchema.virtual('getTotalKcal').get(function(){
    if (!this.totalKcal) {
        let totalKcal = 0;
        for (let i of this.ingredients){
            totalKcal += i.kcal;
        }
        return Math.round(totalKcal);
    } else {
        return this.totalKcal;
    }
})

mealSchema.virtual('getKcalPerGram').get(function(){
    if (this.totalGrams){
        return Math.round(this.getTotalKcal / this.totalGrams * 100) / 100;
    }
})

mealSchema.statics.getAllTags = async function(){
    const allInstances = await this.find({});
    let allTags = [];
    allInstances.map(i => {
        if (i.tags) {
            for (tag of i.tags) {
                if (!allTags.includes(tag))
                    allTags.push(tag)
            }
        }
    });
    return allTags;
}

module.exports.mealSchema = mealSchema;
module.exports.Meal = mongoose.model('Meal', mealSchema);;