import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function WorkoutLogsPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/logs/workouts').then(setData);
    }, []);

    if (!data) return <div className="text-center py-5">Loading…</div>;

    const { allWorkoutLogs, allMonths } = data;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Workout Logs</h2>
                <Link to="/logs/workouts/new" className="btn btn-secondary btn-sm">+ New</Link>
            </div>

            {allMonths.map(month => {
                const logs = allWorkoutLogs.filter(l => l.month === month);
                if (!logs.length) return null;
                return (
                    <div key={month} className="mb-4">
                        <h5>{month.slice(5)}</h5>
                        <div className="d-flex flex-wrap gap-3">
                            {logs.map(log => (
                                <div key={log._id} className="border rounded p-3" style={{ minWidth: '180px' }}>
                                    <div className="fw-bold text-capitalize">{log.name}</div>
                                    <div className="text-muted small">
                                        {log.shortDate} · {log.kcal} kcal
                                        {log.duration !== '00:00' && ` · ${log.duration}`}
                                    </div>
                                    <div className="mt-2">
                                        <Link to={`/logs/workouts/${log._id}`} className="btn btn-sm btn-light border">View</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {!allWorkoutLogs.length && <p className="text-muted">No workout logs yet.</p>}
        </div>
    );
}
