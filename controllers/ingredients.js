const { Ingredient } = require('../models/ingredient');
// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const { category } = req.query;
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)));

    // filtered index per CATEGORY
    if (category && allCategories.includes(category)){
        const allIngredients = await Ingredient.find({ category })
            .catch(e => next(mongoError(e)))
        res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category });

    // show all
    } else {
        const allIngredients = await Ingredient.find({ })
            .catch(e => next(mongoError(e)))
        res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category: "all" });
    }
}

module.exports.renderNewForm = async (req, res, next) => {
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)))
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)))

    res.render('kcalog/db/ingredients/new', { title: "New Ingredient", allNames, allCategories });
}

module.exports.createIngredient = async (req, res, next) => {
    const newIngredient = new Ingredient(req.body.ingredient);
    await newIngredient.save()
        .then(() => res.redirect(`/db/ingredients`))
        .catch(e => next(mongoError(e)))
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)))
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)))
    const ingredient = await Ingredient.findById(id)
        .catch(e => next(mongoError(e)))

    res.render('kcalog/db/ingredients/edit', { title: 'Edit Ingredient', ingredient, allNames, allCategories });
}

module.exports.updateIngredient = async (req, res, next) => {
    const { id } = req.params;

    await Ingredient.findByIdAndUpdate(id, req.body.ingredient, {runValidators:true})
        .then(() => res.redirect(`/db/ingredients`))
        .catch(e => next(mongoError(e)))
}

module.exports.destroyIngredient = async (req, res, next) => {
    const { id } = req.params;
    
    await Ingredient.findByIdAndDelete(id)
        .then(() => res.redirect(`/db/ingredients`))
        .catch(e => next(mongoError(e)))
}