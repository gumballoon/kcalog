// S T A R T I N G  S E T U P //
// if in the development stage, DOTENV will extract to process.env the environment variables stored in the .env file
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
// create a server object, a local server on the machine
const app = express();

// set the templating engine (EJS)
app.set('view engine', 'ejs');
// EJS engine to add layout functionalities
const ejsMate = require('ejs-mate');
// set the engine to run/parse EJS
app.engine('ejs', ejsMate);
// module for working w/ file & directory paths
const path = require('path');
// associate the VIEWS dir w/ the app dir
app.set('views', path.join(__dirname, '/views'));

// module to 'fake' put/patch/delete requests
const methodOverride = require('method-override');
// query string parameter for the HTTP verb
app.use(methodOverride('_method'));

// format dates/times
const dateTime = require('date-and-time');

// parse form data in POST request body
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON in POST request body
app.use(express.json());

// share the directory w/ the public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, '/public')));

const session = require('express-session');
const MongoStore = require('connect-mongo');
const sessionOptions = {
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({ mongoUrl: process.env.DB_URL || 'mongodb://127.0.0.1:27017/kcalog' }),
		cookie: {
                // to delete the cookie after one week
				expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
				maxAge: 1000 * 60 * 60 * 24 * 7,
				// security feature to protect the cookie
                httpOnly: true
		}
}
app.use(session(sessionOptions));

// PASSPORT setup
const passport = require('passport');
const LocalStrategy = require('passport-local'); // to plugin a local strategy (username + password) on PASSPORT
app.use(passport.initialize());
app.use(passport.session()); // to have persistent login sessions (AFTER the session setup)

const { User } = require('./models/user');
passport.use(new LocalStrategy(User.authenticate())); // to use a specific strategy w/ an authentication method located on the model User
passport.serializeUser(User.serializeUser()); // how to store an instance data in the Session
passport.deserializeUser(User.deserializeUser()); // how to delete the stored instance data 

// to display temporary messages
const flash = require('connect-flash');
app.use(flash());

// to automatically send to the rendered template any flash messages that were defined during the req/res cycle
app.use((req, res, next) => {
    // to dynamically set the BS classes w/ the flash category (i.e. 'success', 'error', etc.)
    res.locals.flash = req.flash();
     // to share the stored user info
    res.locals.currentUser = req.user;
    next();
})

const mongoose = require('mongoose');
// surpress a Mongoose 7 warning
mongoose.set('strictQuery', true);
// production DB vs. development DB
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/kcalog';
// connect to a specific db
mongoose.connect(dbURL)
    .then(() => {
        console.log("Connection: Open")
    })
    .catch(err => {
        console.log("Connection: Error")
        console.log(err)
})

// custom Error class (title, status, message) & default MongoDB error
const { AppError, mongoError } = require('./utilities/errors');

// // // // // // // // // // // // // // // //

const { DailyLog } = require('./models/dailyLog');
// populate the Daily Log to get the Meal & Workout kcal + balance
const { getDailyKcal} = require('./utilities/dailyLogs');

// HOME route (1. New Log, 2. Daily Log, 3. Food DB)
app.get('/', async (req, res, next) => {
    const userId = req.user?._id || null;
    const now = new Date();
    const today = dateTime.format(now, 'ddd DD MMMM') // Mon Jan 01

    const daily = await DailyLog.findOne({ userId, calendarDate: now.toDateString() })
        .catch(e => next(mongoError(e)))
    if (daily && (daily.mealLogs.length || daily.workoutLogs.length)) {
        const dailyStats = await getDailyKcal(daily);
        res.render('kcalog/home', { title: 'Home', today, dailyStats });
    } else {
        res.render('kcalog/home', { title: 'Home', today, dailyStats: 0});
    }
})

// U S E R S //
const userRoutes = require('./routes/users');
app.use('', userRoutes);

// M E A L  L O G S //
const mealLogRoutes = require('./routes/mealLogs');
app.use('/logs/meals', mealLogRoutes);

// E X E R C I S E  L O G S //
const workoutLogRoutes = require('./routes/workoutLogs');
app.use('/logs/workouts', workoutLogRoutes);

// D A I L Y  L O G S //
const dailyLogRoutes = require('./routes/dailyLogs');
app.use('/logs', dailyLogRoutes);

// I N G R E D I E N T S //
const ingredientRoutes = require('./routes/ingredients');
app.use('/db/ingredients', ingredientRoutes);

// M E A L S //
const mealRoutes = require('./routes/meals');
app.use('/db/meals', mealRoutes);

// E R R O R S //
// Dead End Route //
app.use((req, res) => {
    req.flash('danger', 'page not found');
    res.redirect('/');
})

// Error Handler //
app.use((err, req, res, next) => {
    req.flash('danger', `${err.flash || 'something went wrong'}`);
    console.log(err);
    res.status(err.status || 500).redirect('/');
})

const PORT = process.env.PORT || 8080;
app.listen(PORT);