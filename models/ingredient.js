const mongoose = require('mongoose'); // import MONGOOSE

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        lowcase: true,
        unique: true,
        required: [true, 'NAME cannot be blank']
    },
    category: {
        type: String,
        lowcase: true,
        required: [true, 'CATEGORY cannot be blank']
    },
    unit: {
        type: String,
        lowcase: true,
        enum: ['gram', 'millilitre', 'piece'],
        required: [true, 'UNIT cannot be blank']
    },
    kcalPerUnit: {
        type: Number,
        min: 0,
        required: [true, 'KCAL PER GRAM cannot be blank']
    }
})

ingredientSchema.statics.getAllCategories = async function(){
    const allInstances = await this.find({});
    let allCategories = [];
    allInstances.map(i => {
        if (!allCategories.includes(i.category))
            allCategories.push(i.category)
    });
    return allCategories;
}

module.exports.Ingredient = mongoose.model('Ingredient', ingredientSchema);