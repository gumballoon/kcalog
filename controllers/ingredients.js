const { Ingredient } = require('../models/ingredient');
const { textCapitalize } = require('../utilities/textCapitalize');
// custom Error class (title, status, message) & default MongoDB error
const { serverError, mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const { category, intoView=null } = req.query;
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)));

    // filtered index per CATEGORY
    if (category && allCategories.includes(category)){
        const allIngredients = await Ingredient.find({ category })
            .catch(e => next(mongoError(e)));

        try {
            res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category, intoView });
        } catch (e) {
            next(serverError(e));
        }

    // show all
    } else {
        const allIngredients = await Ingredient.find({ })
            .catch(e => next(mongoError(e)));

        try {
            res.render('kcalog/db/ingredients/index', { title:'Ingredients', allIngredients, category: "all", intoView });
        } catch (e) {
            next(serverError(e));
        }        
    }
}

module.exports.renderNewForm = async (req, res, next) => {
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)));

    try {
        res.render('kcalog/db/ingredients/new', { title: "New Ingredient", allNames, allCategories });
    } catch (e) {
        next(serverError(e));
    }    
}

module.exports.createIngredient = async (req, res, next) => {
    const newIngredient = new Ingredient(req.body.ingredient);
    await newIngredient.save()
        .then(() => {
            req.flash('success', `${textCapitalize(newIngredient.name)} was created`);
            res.redirect(`/db/ingredients?intoView=${newIngredient._id}`);
        })
        .catch(e => next(mongoError(e)));
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const allNames = await Ingredient.getAllNames()
        .catch(e => next(mongoError(e)));
    const allCategories = await Ingredient.getAllCategories()
        .catch(e => next(mongoError(e)));
    const ingredient = await Ingredient.findById(id)
        .catch(e => next(mongoError(e)));

    try {
        res.render('kcalog/db/ingredients/edit', { title: 'Edit Ingredient', ingredient, allNames, allCategories });
    } catch (e) {
        next(serverError(e));
    }       
}

module.exports.updateIngredient = async (req, res, next) => {
    const { id } = req.params;

    await Ingredient.findByIdAndUpdate(id, req.body.ingredient, {new:true, runValidators:true})
        .then((i) => {
            req.flash('success', `${textCapitalize(i.name)} was updated`);
            res.redirect(`/db/ingredients?intoView=${id}`);
        })
        .catch(e => next(mongoError(e)));
}

module.exports.destroyIngredient = async (req, res, next) => {
    const { id } = req.params;
    
    await Ingredient.findByIdAndDelete(id)
        .then((i) => {
            req.flash('success', `${textCapitalize(i.name)} was deleted`);
            res.redirect(`/db/ingredients`);
        })
        .catch(e => next(mongoError(e)));
}

module.exports.error = (err, req, res, next) => {
    req.flash('danger', 'something went wrong');
    res.status(err.status).redirect('/db/ingredients');
};