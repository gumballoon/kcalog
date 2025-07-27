const { required, func } = require('joi');
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
    ingredients: {
        type: [ {
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
            kcalPerUnit: {
                type: Number,
                min: 0,
                required: [true, 'Ingredients: KCAL PER UNIT cannot be blank']
            },
            quantity: {
                type: Number,
                min: 0,
                required: [true, 'Ingredients: QUANTITY cannot be blank']
            },
            kcal: {
                type: Number,
                min: 0
            }
        } ],
        required: [true, 'INGREDIENTS is required']
    },
    totalKcal: {
        type: Number,
        min: 0
    },
    totalGrams: {
        type: Number,
        min: 1,
        required: [function () {
          return this.serving === 'full';
        }, 'TOTAL GRAMS is required when SERVING is full']
    },
    kcalPerGram: {
        type: Number,
        min: 0
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

// auto-fill the fields KCAL, TOTAL KCAL & KCAL PER GRAM if not provided
mealSchema.pre('save', function(next) {
    for (let i of this.ingredients) {
        if (this.kcal === null || this.kcal === undefined) {
            i.kcal = Math.round(i.quantity * i.kcalPerUnit * 100) / 100;
        }
    }

    if (this.totalKcal === null || this.totalKcal === undefined) {
        let result = 0;
        for (let i of this.ingredients) {
            result += i.kcal;
        }
        this.totalKcal = Math.round(result);
    }

    if (this.serving === 'full' && (this.kcalPerUnit === null || this.kcalPerUnit === undefined)) {
        this.kcalPerGram = Math.round(this.totalKcal / this.totalGrams * 100) / 100;
    }

    next();
});

mealSchema.pre('findOneAndUpdate', function(next) {
    for (let i of this.ingredients) {
        if (this.kcal === null || this.kcal === undefined) {
            i.kcal = Math.round(i.quantity * i.kcalPerUnit * 100) / 100;
        }
    }

    if (this.totalKcal === null || this.totalKcal === undefined) {
        let result = 0;
        for (let i of this.ingredients) {
            result += i.kcal;
        }
        this.totalKcal = Math.round(result);
    }

    if (this.serving === 'full' && (this.kcalPerUnit === null || this.kcalPerUnit === undefined)) {
        this.kcalPerGram = Math.round(this.totalKcal / this.totalGrams * 100) / 100;
    }

    next();
});

mealSchema.statics.getAllNames = async function(){
    const allInstances = await this.find({});
    const allNames = [];
    allInstances.map(i => {
        if (!allNames.includes(i.name)) {
            allNames.push(i.name.toLowerCase());
        }
    })
    return allNames;
};

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
};

module.exports.mealSchema = mealSchema; // to be used on the mealLog.js
module.exports.Meal = mongoose.model('Meal', mealSchema);;