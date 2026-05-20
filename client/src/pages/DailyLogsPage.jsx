import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatsDisplay from '../components/StatsDisplay';

export default function DailyLogsPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/logs').then(setData);
    }, []);

    if (!data) return <div className="text-center py-5">Loading…</div>;

    const { allDailyLogs, allMonths } = data;

    return (
        <div>
            <h2 className="mb-4">All Daily Logs</h2>
            {allMonths.map(month => {
                const logs = allDailyLogs.filter(d => d.month === month);
                if (!logs.length) return null;
                const label = month.slice(5); // "YYMM MMMM YYYY" → "MMMM YYYY"
                return (
                    <div key={month} className="mb-4">
                        <h4>{label}</h4>
                        <div className="d-flex flex-wrap gap-3">
                            {logs.map(log => (
                                <div key={log._id} className="border rounded p-3" style={{ minWidth: '220px' }}>
                                    <div className="fw-bold">{log.shortDate}</div>
                                    <StatsDisplay
                                        mealKcal={log.totalMealKcal}
                                        workoutKcal={log.totalWorkoutKcal}
                                        balance={log.kcalBalance}
                                    />
                                    <Link to={`/logs/${log._id}`} className="btn btn-sm btn-light border w-100">View</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {!allDailyLogs.length && <p className="text-muted">No logs yet.</p>}
        </div>
    );
}
