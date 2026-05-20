import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import StatsDisplay from '../components/StatsDisplay';

export default function DailyLogShowPage({ today: isToday }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dailyLog, setDailyLog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const path = isToday ? '/logs/today' : `/logs/${id}`;
        api.get(path)
            .then(({ dailyLog }) => {
                if (!dailyLog) navigate('/logs');
                else setDailyLog(dailyLog);
            })
            .finally(() => setLoading(false));
    }, [id, isToday, navigate]);

    if (loading) return <div className="text-center py-5">Loading…</div>;
    if (!dailyLog) return null;

    return (
        <div>
            <Link to="/logs" className="btn btn-sm btn-light border mb-3">← All Daily Logs</Link>
            <h2>{dailyLog.longDate}</h2>
            <StatsDisplay
                mealKcal={dailyLog.totalMealKcal}
                workoutKcal={dailyLog.totalWorkoutKcal}
                balance={dailyLog.kcalBalance}
            />

            {dailyLog.mealLogs?.length > 0 && (
                <div className="mt-4">
                    <h5>Meal Logs</h5>
                    <div className="d-flex flex-wrap gap-3">
                        {dailyLog.mealLogs.map(ml => (
                            <div key={ml._id} className="border rounded p-3" style={{ minWidth: '180px' }}>
                                <div className="text-capitalize fw-bold">{ml.meal?.name}</div>
                                <div className="text-muted small">{ml.kcal} kcal</div>
                                <Link to={`/logs/meals?category=${ml.category}`} className="badge bg-secondary text-decoration-none me-1">{ml.category}</Link>
                                <div className="mt-2">
                                    <Link to={`/logs/meals/${ml._id}`} className="btn btn-sm btn-light border">View</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dailyLog.workoutLogs?.length > 0 && (
                <div className="mt-4">
                    <h5>Workout Logs</h5>
                    <div className="d-flex flex-wrap gap-3">
                        {dailyLog.workoutLogs.map(wl => (
                            <div key={wl._id} className="border rounded p-3" style={{ minWidth: '180px' }}>
                                <div className="text-capitalize fw-bold">{wl.name}</div>
                                <div className="text-muted small">{wl.kcal} kcal {wl.duration !== '00:00' && `· ${wl.duration}`}</div>
                                <div className="mt-2">
                                    <Link to={`/logs/workouts/${wl._id}`} className="btn btn-sm btn-light border">View</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
