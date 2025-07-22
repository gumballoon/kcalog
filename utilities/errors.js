// custom Class that is built on top of the native class Error
class AppError extends Error {
    constructor(title, status, message, flash) {
        super();
        this.title = title;
        this.status = status;
        this.message = message;
        this.flash = flash;
    }
}

// default server error w/ a custom message (for Flash)
function serverError(e, flash='something went wrong') {
    return new AppError('App Error', 500, e.message, flash);
}

// default MongoDB error w/ a custom message (for Flash)
function mongoError(e, flash='something went wrong with the database') {
    return new AppError('MongoDB Error', 500, e.message, flash);
};

module.exports = { serverError, mongoError };