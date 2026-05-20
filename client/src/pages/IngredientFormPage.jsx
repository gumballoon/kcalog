import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const UNITS = ['gram', 'millilitre', 'piece'];

export default function IngredientFormPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [formData, setFormData] = useState(null);
    const [form, setForm] = useState({ name: '', category: '', unit: 'gram', kcalPerUnit: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const path = isEdit ? `/ingredients/${id}/form-data` : '/ingredients/form-data';
        api.get(path).then(({ allNames, allCategories, ingredient }) => {
            setFormData({ allNames, allCategories });
            if (ingredient) {
                setForm({
                    name: ingredient.name || '',
                    category: ingredient.category || '',
                    unit: ingredient.unit || 'gram',
                    kcalPerUnit: ingredient.kcalPerUnit ?? '',
                });
            }
        });
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = { ingredient: form };
            const { ingredient: saved, message } = isEdit
                ? await api.put(`/ingredients/${id}`, body)
                : await api.post('/ingredients', body);
            setFlash({ type: 'success', message });
            navigate(`/db/ingredients?intoView=${saved._id}`);
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div className="text-center py-5">Loading…</div>;

    const valid = form.name.trim() && form.category.trim() && form.kcalPerUnit !== '';

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <Link to="/db/ingredients" className="btn btn-sm btn-light border mb-3">← Ingredients</Link>
                <h2 className="mb-4">{isEdit ? 'Edit Ingredient' : 'New Ingredient'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input list="names-list" className="form-control" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase() }))} required />
                        <datalist id="names-list">
                            {formData.allNames.map(n => <option key={n} value={n} />)}
                        </datalist>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Category</label>
                        <input list="categories-list" className="form-control" value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value.toLowerCase() }))} required />
                        <datalist id="categories-list">
                            {formData.allCategories.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Unit</label>
                        <select className="form-select" value={form.unit}
                            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Kcal per {form.unit}</label>
                        <input type="number" className="form-control" min="0" step="0.1" value={form.kcalPerUnit}
                            onChange={e => setForm(f => ({ ...f, kcalPerUnit: e.target.value }))} required />
                    </div>
                    <button className="btn btn-secondary" disabled={!valid || loading}>
                        {loading ? 'Saving…' : isEdit ? 'Update' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}
