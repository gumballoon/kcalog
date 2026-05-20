import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatsDisplay from '../components/StatsDisplay';

export default function HomePage() {
    const [dailyStats, setDailyStats] = useState(null);
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

    useEffect(() => {
        api.get('/logs/home').then(({ dailyStats }) => setDailyStats(dailyStats));
    }, []);

    return (
        <div className="text-center py-4">
            <h1 className="display-3 fw-bold">KCALOG</h1>
            <p className="lead">own your calorie tracking</p>

            <div className="alert alert-light d-inline-block px-4 my-3">{today}</div>

            {dailyStats && (
                <StatsDisplay
                    mealKcal={dailyStats.totalMealKcal}
                    workoutKcal={dailyStats.totalWorkoutKcal}
                    balance={dailyStats.kcalBalance}
                />
            )}

            <div className="mt-4">
                <h5>Add a new log</h5>
                <div className="d-flex justify-content-center gap-3 mt-2">
                    <Link to="/logs/meals/new" className="btn btn-secondary">Meal Log</Link>
                    <Link to="/logs/workouts/new" className="btn btn-secondary">Workout Log</Link>
                </div>
            </div>

            <div className="mt-4">
                <h5>Check your progress</h5>
                <div className="d-flex justify-content-center gap-3 mt-2">
                    <Link to="/logs/today" className="btn btn-light border">Today's Log</Link>
                    <Link to="/logs" className="btn btn-light border">All Daily Logs</Link>
                </div>
            </div>

            <div className="mt-4">
                <h5>Manage the database</h5>
                <div className="d-flex justify-content-center gap-3 mt-2">
                    <Link to="/db/meals" className="btn btn-light border">Meals</Link>
                    <Link to="/db/ingredients" className="btn btn-light border">Ingredients</Link>
                </div>
            </div>
        </div>
    );
}
