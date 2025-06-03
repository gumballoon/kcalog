const { Ingredient } = require('../models/ingredient');

// custom Error class (title, status, message)
const AppError = require('../utilities/AppError')
// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
}

module.exports.index = async (req, res, next) => {
    const { category } = req.query;
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)));
    if (category && allCategories.includes(category)){
        await Ingredient.find({ category })
            .then(allIngredients => res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category }))
            .catch(e => next(mongoError(e)))   
    } else {
        await Ingredient.find({})
            .then(allIngredients => res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category: "all" }))
            .catch(e => next(mongoError(e)))
    }
}

module.exports.renderNewForm = async (req, res, next) => {
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)))
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)))
    
    res.render('kcalog/db/ingredients/new', { title: "New Ingredient", allNames, allCategories })
}

module.exports.createIngredient = async (req, res, next) => {
    const newIng = new Ingredient(req.body.ingredient);
    await newIng.save()
        .then(() => res.redirect(`/kcalog/db/ingredients`))
        .catch(e => next(mongoError(e)))
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)))
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)))
    const foundIngredient = await Ingredient.findById(id)
        .catch(e => next(mongoError(e)))
    res.render('kcalog/db/ingredients/edit', { title: 'Edit Ingredient', foundIngredient, allNames, allCategories })
}

module.exports.updateIngredient = async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndUpdate(id, req.body.ingredient, {runValidators:true})
        .then(() => res.redirect(`/kcalog/db/ingredients`))
        .catch(e => next(mongoError(e)))
}

module.exports.destroyIngredient = async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndDelete(id)
        .then(() => res.redirect(`/kcalog/db/ingredients`))
        .catch(e => next(mongoError(e)))
}