const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        unique: true,
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
        default: 'wifey',
        required: true
    }
})

ingredientSchema.statics.getAllNames = async function(){
    const allInstances = await this.find({});
    const allNames = allInstances.map(i => i.name);
    return allNames;
}

ingredientSchema.statics.getAllCategories = async function(){
    const allInstances = await this.find({});
    let allCategories = [];
    allInstances.map(i => {
        if (!allCategories.includes(i.category))
            allCategories.push(i.category)
    });
    return allCategories;
}

// simplified Ingredient data for the Meal & MealLog routes
ingredientSchema.statics.getFormattedIngredientData = async function(){
    const allInstances = await this.find({});
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