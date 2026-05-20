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
            quantity: {
                type: Number,
                min: 0,
                default: 0,
                required: [true, 'Ingredients: QUANTITY cannot be blank']
            },
            kcal: {
                type: Number,
                min: 0,
                default: 0,
                required: [true, 'Ingredients: KCAL cannot be blank']
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
        required: true
    }
})

// auto-fill the fields TOTAL KCAL & KCAL PER GRAM if not provided
mealSchema.pre('save', function(next) {
    if (this.totalKcal === null || this.totalKcal === undefined) {
        let result = 0;
        for (let i of this.ingredients) {
            result += i.kcal;
        }
        this.totalKcal = Math.round(result);
    }

    if (this.serving === 'full' && (this.kcalPerGram === null || this.kcalPerGram === undefined)) {
        if (this.totalKcal > 0) {
            this.kcalPerGram = Math.round(this.totalKcal / this.totalGrams * 100) / 100;
        } else {
            this.kcalPerGram = 0;
        }
    }

    next();
});

mealSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();

    if (update.ingredients && (!update.totalKcal && update.totalKcal !== 0)) {
        let result = 0;
        for (let i of update.ingredients) {
            result += i.kcal;
        }
        update.totalKcal = Math.round(result);
    }

    if (update.serving === 'full' && (update.kcalPerGram === null || update.kcalPerGram === undefined)) {
        if (update.totalKcal > 0 && update.totalGrams) {
            update.kcalPerGram = Math.round(update.totalKcal / update.totalGrams * 100) / 100;
        } else {
            update.kcalPerGram = 0;
        }
    }

    this.setUpdate(update);
    next();
});


// to catch duplication errors & add a custom message
mealSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('A meal with the given name is already saved'));
    } else {
        next(error);
    }
});

mealSchema.statics.getAllNames = async function(userId){
    const allInstances = await this.find({ userId });
    const allNames = [];
    allInstances.map(i => {
        if (!allNames.includes(i.name)) {
            allNames.push(i.name.toLowerCase());
        }
    })
    return allNames;
};

mealSchema.statics.getAllTags = async function(userId){
    const allInstances = await this.find({ userId });
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