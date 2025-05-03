const mongoose = require('mongoose'); // import MONGOOSE

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'NAME cannot be blank'],
        lowcase: true
    },
    kcalPerGram: {
        type: Number,
        required: [true, 'KCAL PER GRAM cannot be blank'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'CATEGORY cannot be blank'],
        lowcase: true
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

const Ingredient = mongoose.model('Ingredient', ingredientSchema)

module.exports = Ingredient;