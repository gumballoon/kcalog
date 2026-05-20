const { User } = require('../models/user');
const { Ingredient } = require('../models/ingredient');
const ingredients = require('../../public/data/ingredients');
const { mongoError } = require('../utilities/errors');
const { signToken, cookieOptions } = require('../utilities/auth');

module.exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('username email');
        if (!user) return res.status(404).json({ error: 'user not found' });
        res.json({ user });
    } catch (e) {
        next(mongoError(e));
    }
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        const token = signToken(registeredUser._id);
        res.cookie('token', token, cookieOptions);

        // seed default ingredients for the new user
        const userIngredients = ingredients.map(i => ({ ...i, userId: registeredUser._id }));
        await Ingredient.insertMany(userIngredients).catch(e => console.log(e));

        res.json({ user: { _id: registeredUser._id, username: registeredUser.username }, message: 'welcome to KCALOG' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

module.exports.loginUser = (req, res, next) => {
    const { username, password } = req.body;
    const authenticate = User.authenticate();
    authenticate(username, password, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || 'invalid username or password' });
        const token = signToken(user._id);
        res.cookie('token', token, cookieOptions)
           .json({ user: { _id: user._id, username: user.username }, message: 'welcome back to KCALOG' });
    });
};

module.exports.logoutUser = (req, res) => {
    res.clearCookie('token').json({ message: 'you have successfully logged out' });
};

module.exports.error = (err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
};
