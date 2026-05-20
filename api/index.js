if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '../.env' });
}

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

mongoose.set('strictQuery', true);
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/kcalog';

// cache the connection across serverless invocations
let dbConnected = false;
async function connectDB() {
    if (dbConnected) return;
    await mongoose.connect(dbURL);
    dbConnected = true;
    console.log('DB: Open');
}

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL].filter(Boolean)
    : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.log('DB: Error', err);
        res.status(500).json({ error: 'database connection failed' });
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

const userRoutes = require('./routes/users');
const mealLogRoutes = require('./routes/mealLogs');
const workoutLogRoutes = require('./routes/workoutLogs');
const dailyLogRoutes = require('./routes/dailyLogs');
const ingredientRoutes = require('./routes/ingredients');
const mealRoutes = require('./routes/meals');

app.use('/api', userRoutes);
app.use('/api/logs/meals', mealLogRoutes);
app.use('/api/logs/workouts', workoutLogRoutes);
app.use('/api/logs', dailyLogRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/meals', mealRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).json({ error: err.flash || 'something went wrong' });
});

if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

module.exports = app;
