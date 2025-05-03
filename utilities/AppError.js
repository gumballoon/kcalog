// custom Class that is built on top of the native class Error
class AppError extends Error {
    constructor(title, status, message) {
        super();
        this.title = title;
        this.status = status;
        this.message = message;
    }
}

module.exports = AppError;  