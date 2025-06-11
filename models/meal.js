const mongoose = require('mongoose'); // import MONGOOSE
const { Ingredient } = require('./ingredient');
const { func } = require('joi');
const { Schema } = mongoose;

const mealSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, 'NAME cannot be blank']
    },
    serving: {
        type: String,
        lowercase: true,
        enum: ['single', 'full'],
        required: [true, 'SERVING cannot be blank']
    },
    ingredients: [ {
        _id: {_id: false},
        name: {
            type: String,
            lowercase: true,
            unique: false,
            required: [true, 'Ingredients: NAME cannot be blank']
        },
        category: {
            type: String,
            lowercase: true
        },
        unit: {
            type: String,
            lowercase: true,
            enum: ['gram', 'millilitre', 'piece'],
            required: [true, 'Ingredients: UNIT cannot be blank']
        },
        quantity: {
            type: Number,
            required: [true, 'Ingredients: QUANTITY cannot be blank']
        },
        kcal: Number,
        kcalPerUnit: Number
    } ],
    totalKcal: Number,
    totalGrams: {
        type: Number,
        required: [function () {
          return this.serving === 'full';
        }, 'TOTAL GRAMS is required when SERVING is full']
    },
    tags: [ String ],
    notes: String,
    image: String
})

// to ignore any empty TAGS (i.e. "")
mealSchema.pre('save', function() {
    const filteredTags = this.tags.filter(t => t !== '');
    this.tags = filteredTags;
})
mealSchema.pre('updateOne', function() {
    const filteredTags = this.tags.filter(t => t !== '');
    this.tags = filteredTags;
})

// to calculate the KCAL of each ingredient (where it wasn't provided)
mealSchema.pre('save', function() {
    for (let i of this.ingredients) {
        if (!i.kcal) {
            i.kcal = Math.round(i.quantity * i.kcalPerUnit);
        }
    }
})

// to calculate the KCAL PER UNIT of each ingredient (where it wasn't provided)
mealSchema.pre('save', function() {
    for (let i of this.ingredients) {
        if (!i.kcalPerUnit) {
            i.kcalPerUnit = Math.round(i.kcal / i.quantity);
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
    } else {
        return 'n/a';
    }
})

mealSchema.statics.getAllNames = async function(){
    const allInstances = await this.find({});
    const allNames = [];
    allInstances.map(i => {
        if (!allNames.includes(i.name)) {
            allNames.push(i.name.toLowerCase())
        }
    })
    return allNames;
}

mealSchema.statics.getAllTags = async function(){
    const allInstances = await this.find({});
    let allTags = [];
    allInstances.map(i => {
        if (i.tags) {
            for (let tag of i.tags) {
                if (!allTags.includes(tag)) {
                    allTags.push(tag.toLowerCase())
                }
            }
        }
    });
    return allTags;
}

module.exports.mealSchema = mealSchema;
module.exports.Meal = mongoose.model('Meal', mealSchema);;