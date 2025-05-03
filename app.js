// on index.js
// Starting Setup //
const express = require('express'); // import EXPRESS
const app = express(); // to create a server object, a local server on the machine

app.set('view engine', 'ejs'); // to set the templating engine (EJS)
const ejsMate = require('ejs-mate'); // EJS engine to add layout functionalities
app.engine('ejs', ejsMate); // to set the engine to run/parse EJS
const path = require('path'); // module for working w/ file & directory paths
app.set('views', path.join(__dirname, '/views')); // to associate the VIEWS dir w/ the app dir

const methodOverride = require('method-override'); // to 'fake' put/patch/delete requests
app.use(methodOverride('_method')); // query string parameter for the HTTP verb

app.use(express.urlencoded({ extended: true })) // to parse form data in POST request body
app.use(express.json()) // to parse incoming JSON in POST request body

app.listen(8080, () => console.log('Listening on port 8080...')); // to set the server on the port 8080
app.use(express.static(path.join(__dirname, '/public'))); // to share the directory w/ the public assets (CSS, JS, images)

const mongoose = require('mongoose'); // import MONGOOSE
mongoose.connect('mongodb://127.0.0.1:27017/kcalog') // to connect to a specific db
    .then(() => {
        console.log("Connection: Open")
    })
    .catch(err => {
        console.log("Connection: Error")
        console.log(err)
    })
mongoose.set('strictQuery', true); // to surpress a Mongoose 7 warning

// custom Error class (title, status, message)
const AppError = require('./utilities/AppError')

// // // // // // // // // // // // // // // //

// HOME route (1. New Log, 2. Daily Log, 3. Food DB)
app.get('/kcalog', (req, res) => {
    res.render('kcalog/home', { title: 'Home'});
})

// // M E A L  L O G S // //
const mealLogRoutes = require('./routes/mealLogs');
app.use('/kcalog/logs/meals', mealLogRoutes);

// // E X E R C I S E  L O G S // //
const exerciseLogRoutes = require('./routes/exerciseLogs');
app.use('/kcalog/logs/exercises', exerciseLogRoutes);

// // D A I L Y  L O G S // //
const dailyLogRoutes = require('./routes/dailyLogs');
app.use('/kcalog/logs', dailyLogRoutes);

// DB route (1. Ingredients 2. Meals)
app.get('/kcalog/db', (req, res) => {
    res.render('kcalog/db/index', { title: 'Database'})
})

// // I N G R E D I E N T S //
const ingredientRoutes = require('./routes/ingredients');
app.use('/kcalog/db/ingredients', ingredientRoutes);

// // M E A L S // //
const mealRoutes = require('./routes/meals');
app.use('/kcalog/db/meals', mealRoutes);