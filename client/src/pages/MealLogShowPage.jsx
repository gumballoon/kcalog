import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function MealLogShowPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mealLog, setMealLog] = useState(null);

    useEffect(() => {
        api.get(`/logs/meals/${id}`).then(({ mealLog }) => setMealLog(mealLog));
    }, [id]);

    const handleDelete = async () => {
        try {
            const { message } = await api.delete(`/logs/meals/${id}`);
            setFlash({ type: 'success', message });
            navigate('/logs/meals');
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        }
    };

    if (!mealLog) return <div className="text-center py-5">Loading…</div>;

    const meal = mealLog.meal;
    return (
        <div>
            <Link to="/logs/meals" className="btn btn-sm btn-light border mb-3">← All Meal Logs</Link>
            <h2 className="text-capitalize">{meal.name}</h2>
            <div className="text-muted mb-2">{mealLog.longDate} · {mealLog.category}</div>

            <div className="d-flex gap-4 border rounded p-3 mb-3">
                <div><span className="fw-bold">{mealLog.kcal}</span> <small>kcal</small></div>
                {mealLog.grams && <div><span className="fw-bold">{mealLog.grams}g</span></div>}
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

            {mealLog.notes && <p className="text-muted">{mealLog.notes}</p>}

            <div className="d-flex gap-2 mt-3">
                <Link to={`/logs/meals/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
            </div>

            <DeleteConfirmModal id="deleteModal" name="Meal Log" onConfirm={handleDelete} />
        </div>
    );
}
