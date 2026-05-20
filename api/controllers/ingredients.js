const { Ingredient } = require('../models/ingredient');
const { orderByName } = require('../utilities/orderByName');
const { textCapitalize } = require('../utilities/textCapitalize');
const { mongoError } = require('../utilities/errors');

module.exports.index = async (req, res, next) => {
    const userId = req.userId;
    const { intoView = null } = req.query;
    try {
        const [allCategories, ingredients] = await Promise.all([
            Ingredient.getAllCategories(userId),
            Ingredient.find({ userId }),
        ]);
        res.json({ allCategories, allIngredients: orderByName(ingredients), intoView });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.getFormData = async (req, res, next) => {
    const userId = req.userId;
    try {
        const [allNames, allCategories] = await Promise.all([
            Ingredient.getAllNames(userId),
            Ingredient.getAllCategories(userId),
        ]);
        res.json({ allNames, allCategories });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.createIngredient = async (req, res, next) => {
    const userId = req.userId;
    const newIngredient = new Ingredient(req.body.ingredient);
    newIngredient.userId = userId;
    await newIngredient.save()
        .then(i => res.status(201).json({ ingredient: i, message: `${textCapitalize(i.name)} was created` }))
        .catch(e => next(mongoError(e)));
};

module.exports.getEditFormData = async (req, res, next) => {
    const userId = req.userId;
    const { id } = req.params;
    try {
        const [allNames, allCategories, ingredient] = await Promise.all([
            Ingredient.getAllNames(userId),
            Ingredient.getAllCategories(userId),
            Ingredient.findById(id),
        ]);
        res.json({ ingredient, allNames, allCategories });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.updateIngredient = async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndUpdate(id, req.body.ingredient, { new: true, runValidators: true })
        .then(i => res.json({ ingredient: i, message: `${textCapitalize(i.name)} was updated` }))
        .catch(e => next(mongoError(e)));
};

module.exports.destroyIngredient = async (req, res, next) => {
    const { id } = req.params;
    await Ingredient.findByIdAndDelete(id)
        .then(i => res.json({ message: `${textCapitalize(i.name)} was deleted` }))
        .catch(e => next(mongoError(e)));
};

module.exports.error = (err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
};
