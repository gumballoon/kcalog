const mongoose = require('mongoose');
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
            min: 0,
            required: [true, 'Ingredients: QUANTITY cannot be blank']
        },
        kcal: {
            type: Number,
            min: 0,
            default: 0
        },
        kcalPerUnit: {
            type: Number,
            min: 0
        }
    } ],
    totalKcal: {
        type: Number,
        min: 0,
        default: function() {
            let result = 0;
            for (let i of this.ingredients) {
                result += i.kcal;
            }
            return Math.round(result);
        }
    },
    totalGrams: {
        type: Number,
        min: 0,
        required: [function () {
          return this.serving === 'full';
        }, 'TOTAL GRAMS is required when SERVING is full']
    },
    kcalPerGram: {
        type: Number,
        min: 0,
        default: function() {
            if (this.serving === 'full') {
                return Math.round(this.totalKcal / this.totalGrams * 100) / 100;
            } else {
                return null;
            }
        }
    },
    tags: [ String ],
    notes: String,
    image: {
        type: String,
        default: '/images/default-meal.svg'
    },
    userId: {
        type: String,
        default: 'wifey',
        required: true
    }
})

mealSchema.statics.getAllNames = async function(){
    const allInstances = await this.find({});
    const allNames = [];
    allInstances.map(i => {
        if (!allNames.includes(i.name)) {
            allNames.push(i.name.toLowerCase());
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
                    allTags.push(tag.toLowerCase());
                }
            }
        }
    });
    return allTags;
}

module.exports.mealSchema = mealSchema; // to be used on the mealLog.js
module.exports.Meal = mongoose.model('Meal', mealSchema);;