module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('danger', 'you must be logged-in');
        return res.redirect('/login');
    } else {
        return next();
    }
}

module.exports.isLoggedOut = (req, res, next) => {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    } else {
        return next();
    }
}