import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function IngredientsPage({ setFlash }) {
    const [searchParams] = useSearchParams();
    const intoView = searchParams.get('intoView');
    const [data, setData] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const itemRefs = useRef({});

    const fetchData = () => {
        api.get('/ingredients').then(setData);
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (intoView && itemRefs.current[intoView]) {
            itemRefs.current[intoView].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [data, intoView]);

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            const { message } = await api.delete(`/ingredients/${toDelete._id}`);
            setFlash({ type: 'success', message });
            fetchData();
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setToDelete(null);
        }
    };

    if (!data) return <div className="text-center py-5">Loading…</div>;

    const { allCategories, allIngredients } = data;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Ingredients</h2>
                <Link to="/db/ingredients/new" className="btn btn-secondary btn-sm">+ New</Link>
            </div>

            {allCategories.map(cat => {
                const items = allIngredients.filter(i => i.category === cat);
                if (!items.length) return null;
                return (
                    <div key={cat} className="mb-4">
                        <h5 className="text-capitalize">{cat}</h5>
                        <ul className="list-group">
                            {items.map(ing => (
                                <li key={ing._id} ref={el => itemRefs.current[ing._id] = el}
                                    className={`list-group-item d-flex justify-content-between align-items-center ${intoView === ing._id ? 'list-group-item-secondary' : ''}`}>
                                    <div>
                                        <span className="text-capitalize fw-bold">{ing.name}</span>
                                        <span className="text-muted small ms-2">{ing.kcalPerUnit} kcal/{ing.unit}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link to={`/db/ingredients/${ing._id}/edit`} className="btn btn-sm btn-light border">Edit</Link>
                                        <button className="btn btn-sm btn-danger"
                                            data-bs-toggle="modal" data-bs-target="#deleteModal"
                                            onClick={() => setToDelete(ing)}>
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}

            <DeleteConfirmModal id="deleteModal" name={toDelete?.name} onConfirm={handleDelete} />
        </div>
    );
}
