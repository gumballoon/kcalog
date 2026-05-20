import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';

const CATEGORIES = ['breakfast', 'lunch', 'snack', 'dinner'];

export default function MealLogsPage({ setFlash }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'all';
    const [data, setData] = useState(null);

    useEffect(() => {
        const path = category !== 'all' ? `/logs/meals?category=${category}` : '/logs/meals';
        api.get(path).then(setData);
    }, [category]);

    if (!data) return <div className="text-center py-5">Loading…</div>;

    const { allMealLogs, allMonths } = data;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Meal Logs</h2>
                <Link to="/logs/meals/new" className="btn btn-secondary btn-sm">+ New</Link>
            </div>

            <div className="d-flex gap-2 mb-4 flex-wrap">
                {['all', ...CATEGORIES].map(cat => (
                    <button key={cat} className={`btn btn-sm ${category === cat ? 'btn-secondary' : 'btn-light border'}`}
                        onClick={() => setSearchParams(cat !== 'all' ? { category: cat } : {})}>
                        {cat}
                    </button>
                ))}
            </div>

            {allMonths.map(month => {
                const logs = allMealLogs.filter(l => l.month === month);
                if (!logs.length) return null;
                return (
                    <div key={month} className="mb-4">
                        <h5>{month.slice(5)}</h5>
                        <div className="d-flex flex-wrap gap-3">
                            {logs.map(log => (
                                <div key={log._id} className="border rounded p-3" style={{ minWidth: '180px' }}>
                                    <div className="fw-bold text-capitalize">{log.meal?.name}</div>
                                    <div className="text-muted small">{log.shortDate} · {log.kcal} kcal</div>
                                    <span className="badge bg-secondary">{log.category}</span>
                                    <div className="mt-2">
                                        <Link to={`/logs/meals/${log._id}`} className="btn btn-sm btn-light border">View</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {!allMealLogs.length && <p className="text-muted">No meal logs yet.</p>}
        </div>
    );
}
