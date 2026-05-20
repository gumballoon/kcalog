const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: [true, 'NAME cannot be blank']
    },
    category: {
        type: String,
        lowercase: true,
        required: [true, 'CATEGORY cannot be blank']
    },
    unit: {
        type: String,
        lowercase: true,
        enum: ['gram', 'millilitre', 'piece'],
        required: [true, 'UNIT cannot be blank']
    },
    kcalPerUnit: {
        type: Number,
        min: 0,
        required: [true, 'KCAL PER GRAM cannot be blank']
    },
    image: {
        type: String,
        default: '/images/default-ingredient.svg'
    },
    userId: {
        type: String,
        required: true
    }
})

// to catch duplication errors & add a custom message
ingredientSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('An ingredient with the given name is already saved'));
    } else {
        next(error);
    }
});

ingredientSchema.statics.getAllNames = async function(userId){
    const allInstances = await this.find({ userId });
    const allNames = allInstances.map(i => i.name);
    return allNames;
}

ingredientSchema.statics.getAllCategories = async function(userId){
    const allInstances = await this.find({ userId });
    let allCategories = [];
    allInstances.map(i => {
        if (!allCategories.includes(i.category))
            allCategories.push(i.category)
    });
    return allCategories;
}

// simplified Ingredient data for the Meal & MealLog routes
ingredientSchema.statics.getFormattedIngredientData = async function(userId){
    const allInstances = await this.find({ userId });
    const data = {};
    for (let i of allInstances) {
        data[i.name] = {
            unit: i.unit,
            kcalPerUnit: i.kcalPerUnit
        }
    }
    return data;
}

module.exports.Ingredient = mongoose.model('Ingredient', ingredientSchema);