import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function MealShowPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meal, setMeal] = useState(null);

    useEffect(() => {
        api.get(`/meals/${id}`).then(({ meal }) => setMeal(meal));
    }, [id]);

    const handleDelete = async () => {
        try {
            const { message } = await api.delete(`/meals/${id}`);
            setFlash({ type: 'success', message });
            navigate('/db/meals');
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        }
    };

    if (!meal) return <div className="text-center py-5">Loading…</div>;

    return (
        <div>
            <Link to="/db/meals" className="btn btn-sm btn-light border mb-3">← All Meals</Link>
            <h2 className="text-capitalize">{meal.name}</h2>

            <div className="d-flex gap-4 border rounded p-3 mb-3 flex-wrap">
                <div><span className="fw-bold">{meal.serving}</span> <small>serving</small></div>
                <div><span className="fw-bold">{meal.totalKcal}</span> <small>kcal</small></div>
                {meal.serving === 'full' && (
                    <>
                        <div><span className="fw-bold">{meal.totalGrams}g</span></div>
                        <div><span className="fw-bold">{meal.kcalPerGram}</span> <small>kcal/g</small></div>
                    </>
                )}
            </div>

            {meal.ingredients?.length > 0 && (
                <div className="mb-3">
                    <h6>Ingredients</h6>
                    <ul className="list-unstyled">
                        {meal.ingredients.map((ing, i) => (
                            <li key={i} className="d-flex gap-2 align-items-center mb-1">
                                <span className="text-capitalize">{ing.name}</span>
                                <span className="badge bg-light text-dark border">{ing.quantity} {ing.unit}</span>
                                <span className="badge bg-light text-dark border">{ing.kcal} kcal</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {meal.tags?.length > 0 && (
                <div className="mb-3">
                    {meal.tags.map(t => <span key={t} className="badge bg-secondary me-1">{t}</span>)}
                </div>
            )}

            {meal.notes && <p className="text-muted">{meal.notes}</p>}

            <div className="d-flex gap-2 mt-3">
                <Link to={`/db/meals/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
            </div>

            <DeleteConfirmModal id="deleteModal" name="Meal" onConfirm={handleDelete} />
        </div>
    );
}
