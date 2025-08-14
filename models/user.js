const mongoose = require('mongoose');
const { Schema } = mongoose;

// PASSPORT implementation for Moongoose (to simplify the whole process)
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'USERNAME cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'EMAIL cannot be blank'],
        unique: true
    }
})

// to catch duplication errors & add a custom message
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('The given email is already in use'));
    } else {
        next(error);
    }
});
// to add onto the Schema the fields: 1. username 2. password
userSchema.plugin(passportLocalMongoose);

module.exports.User = mongoose.model('User', userSchema);