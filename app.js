// S T A R T I N G  S E T U P //
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

// set the server on the port 8080
app.listen(8080, () => console.log('Listening on port 8080...'));
// to share the directory w/ the public assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, '/public')));

const mongoose = require('mongoose');
// to surpress a Mongoose 7 warning
mongoose.set('strictQuery', true);
// to connect to a specific db
mongoose.connect('mongodb://127.0.0.1:27017/kcalog')
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
app.get('/kcalog', async (req, res, next) => {
    const now = new Date();
    const today = dateTime.format(now, 'ddd DD MMMM') // Mon Jan 01

    const daily = await DailyLog.findOne({ calendarDate: now.toDateString() })
        .catch(e => next(mongoError(e)))
    console.log(daily)
    if (daily && (daily.mealLogs.length || daily.workoutLogs.length)) {
        const dailyStats = await getDailyKcal(daily);
        res.render('kcalog/home', { title: 'Home', today, dailyStats });
    } else {
        res.render('kcalog/home', { title: 'Home', today, dailyStats: 0});
    }
})

// M E A L  L O G S //
const mealLogRoutes = require('./routes/mealLogs');
app.use('/kcalog/logs/meals', mealLogRoutes);

// E X E R C I S E  L O G S //
const workoutLogRoutes = require('./routes/workoutLogs');
app.use('/kcalog/logs/workouts', workoutLogRoutes);

// D A I L Y  L O G S //
const dailyLogRoutes = require('./routes/dailyLogs');
app.use('/kcalog/logs', dailyLogRoutes);

// I N G R E D I E N T S //
const ingredientRoutes = require('./routes/ingredients');
app.use('/kcalog/db/ingredients', ingredientRoutes);

// M E A L S //
const mealRoutes = require('./routes/meals');
app.use('/kcalog/db/meals', mealRoutes);