// custom Class that is built on top of the native class Error
class AppError extends Error {
    constructor(title, status, message) {
        super();
        this.title = title;
        this.status = status;
        this.message = message;
    }
}

// default MongoDB error
function mongoError(e) {
    return new AppError('MongoDB Error', 500, e.message)
};

module.exports = { AppError, mongoError }