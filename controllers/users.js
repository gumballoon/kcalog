const { User } = require('../models/user');
const { Ingredient } = require('../models/ingredient');
const ingredients = require('../public/data/ingredients');
const passport = require('passport');
const { mongoError } = require('../utilities/errors');

module.exports.renderRegisterForm = (req, res, next) => {
    try {
        res.render('kcalog/users/register');
    } catch (e) {
        next(mongoError(e));
    }
}

module.exports.registerUser = async (req, res, next) => {
    try { 
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        // to keep the user logged-in after a succefully registration
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            } else {
                req.flash('success', 'welcome to KCALOG');
                res.redirect('/');
            }
        })

        // to generate the default ingredients (each associated w/ the user's id)
        const userIngredients = ingredients.map(i => {
            return {...i, userId: req.user._id};
        })
        await Ingredient.insertMany(userIngredients)
            .catch(e => console.log(e))

    } catch(e) {
        req.flash('danger', e.message);
        res.redirect('/register');
    }
}  

module.exports.renderLoginForm = (req, res, next) => {
    try {
        res.render('kcalog/users/login');
    } catch (e) {
        next(mongoError(e));
    }
}

module.exports.loginUser = [
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}),
    // if the login is successful...
    (req, res) => {
        req.flash('success', 'welcome back to KCALOG');
        res.redirect('/');
    }
]

module.exports.logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('danger', err.message);
            res.redirect('/');
        } else {
            req.flash('success', 'you have successfully logged-out');
            res.redirect('/');
        }
    })
}

module.exports.error = (err, req, res, next) => {
    req.flash('danger', `${err.flash || 'something went wrong'}`);
    console.log(err);
    res.status(err.status).redirect('/');
};