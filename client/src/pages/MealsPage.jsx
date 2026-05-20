import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function MealsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tag = searchParams.get('tag') || 'all';
    const serving = searchParams.get('serving') || 'all';
    const [data, setData] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams();
        if (tag !== 'all') params.set('tag', tag);
        if (serving !== 'all') params.set('serving', serving);
        api.get(`/meals?${params}`).then(setData);
    }, [tag, serving]);

    if (!data) return <div className="text-center py-5">Loading…</div>;

    const { allMeals, allTags } = data;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Meals</h2>
                <Link to="/db/meals/new" className="btn btn-secondary btn-sm">+ New</Link>
            </div>

            <div className="mb-3">
                <div className="d-flex gap-2 flex-wrap mb-2">
                    {['all', ...allTags].map(t => (
                        <button key={t} className={`btn btn-sm ${tag === t ? 'btn-secondary' : 'btn-light border'}`}
                            onClick={() => setSearchParams(t !== 'all' ? { tag: t } : {})}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="d-flex gap-2">
                    {['all', 'single', 'full'].map(s => (
                        <button key={s} className={`btn btn-sm ${serving === s ? 'btn-secondary' : 'btn-light border'}`}
                            onClick={() => setSearchParams(s !== 'all' ? { serving: s } : {})}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="d-flex flex-wrap gap-3">
                {allMeals.map(meal => (
                    <div key={meal._id} className="border rounded p-3" style={{ minWidth: '200px' }}>
                        <div className="fw-bold text-capitalize">{meal.name}</div>
                        <div className="text-muted small">
                            {meal.serving === 'full' ? `${meal.kcalPerGram} kcal/g` : `${meal.totalKcal} kcal`}
                        </div>
                        <div className="d-flex flex-wrap gap-1 my-1">
                            {meal.tags?.map(t => (
                                <span key={t} className="badge bg-light text-dark border" style={{ cursor: 'pointer' }}
                                    onClick={() => setSearchParams({ tag: t })}>
                                    {t}
                                </span>
                            ))}
                        </div>
                        <Link to={`/db/meals/${meal._id}`} className="btn btn-sm btn-light border">View</Link>
                    </div>
                ))}
            </div>
            {!allMeals.length && <p className="text-muted mt-3">No meals yet.</p>}
        </div>
    );
}
