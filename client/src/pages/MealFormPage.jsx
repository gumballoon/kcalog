import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const UNITS = ['gram', 'millilitre', 'piece'];
const SERVINGS = ['single', 'full'];
const emptyIngredient = () => ({ name: '', unit: 'gram', quantity: '', kcal: '' });

export default function MealFormPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [formData, setFormData] = useState(null);
    const [form, setForm] = useState({
        name: '', serving: 'single', totalGrams: '', tags: '', notes: '',
        ingredients: [emptyIngredient()],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const path = isEdit ? `/meals/${id}/form-data` : '/meals/form-data';
        api.get(path).then(({ allIngredients, allIngNames, allMealNames, allTags, meal }) => {
            setFormData({ allIngredients, allIngNames, allMealNames, allTags });
            if (meal) {
                setForm({
                    name: meal.name || '',
                    serving: meal.serving || 'single',
                    totalGrams: meal.totalGrams || '',
                    tags: (meal.tags || []).join('+++'),
                    notes: meal.notes || '',
                    ingredients: meal.ingredients?.length ? meal.ingredients.map(i => ({
                        name: i.name, unit: i.unit, quantity: i.quantity, kcal: i.kcal,
                    })) : [emptyIngredient()],
                });
            }
        });
    }, [id, isEdit]);

    const updateIngredient = useCallback((idx, field, value) => {
        setForm(f => {
            const ings = [...f.ingredients];
            ings[idx] = { ...ings[idx], [field]: value };

            // auto-calculate kcal from ingredient DB
            if ((field === 'name' || field === 'quantity') && formData) {
                const ingData = formData.allIngredients.find(i => i.name === ings[idx].name);
                if (ingData && ings[idx].quantity) {
                    ings[idx].kcal = Math.round(ingData.kcalPerUnit * Number(ings[idx].quantity));
                }
            }
            return { ...f, ingredients: ings };
        });
    }, [formData]);

    const totalKcal = form.ingredients.reduce((sum, i) => sum + (Number(i.kcal) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const mealBody = {
                ...form,
                totalKcal,
                ingredients: form.ingredients.filter(i => i.name),
            };
            const body = { meal: mealBody };
            const { meal: saved, message } = isEdit
                ? await api.put(`/meals/${id}`, body)
                : await api.post('/meals', body);
            setFlash({ type: 'success', message });
            navigate(`/db/meals/${saved._id}`);
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div className="text-center py-5">Loading…</div>;

    const valid = form.name.trim() && form.ingredients.some(i => i.name);

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
                <Link to="/db/meals" className="btn btn-sm btn-light border mb-3">← Meals</Link>
                <h2 className="mb-4">{isEdit ? 'Edit Meal' : 'New Meal'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input list="meal-names-list" className="form-control" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase() }))} required />
                        <datalist id="meal-names-list">
                            {formData.allMealNames.map(n => <option key={n} value={n} />)}
                        </datalist>
                    </div>

                    <div className="mb-3">
                        <label className="form-label d-block">Serving</label>
                        {SERVINGS.map(s => (
                            <div key={s} className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" id={`serving-${s}`}
                                    checked={form.serving === s} onChange={() => setForm(f => ({ ...f, serving: s }))} />
                                <label className="form-check-label" htmlFor={`serving-${s}`}>{s}</label>
                            </div>
                        ))}
                    </div>

                    {form.serving === 'full' && (
                        <div className="mb-3">
                            <label className="form-label">Total Grams</label>
                            <input type="number" className="form-control" min="1" value={form.totalGrams}
                                onChange={e => setForm(f => ({ ...f, totalGrams: e.target.value }))} />
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">Ingredients</label>
                        {form.ingredients.map((ing, idx) => (
                            <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                                <button type="button" className="btn btn-sm btn-light border"
                                    onClick={() => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))}>✕</button>
                                <input list="ing-names-list" className="form-control" placeholder="name" value={ing.name}
                                    onChange={e => updateIngredient(idx, 'name', e.target.value.toLowerCase())} />
                                <select className="form-select" style={{ maxWidth: '120px' }} value={ing.unit}
                                    onChange={e => updateIngredient(idx, 'unit', e.target.value)}>
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <input type="number" className="form-control" placeholder="qty" min="0" value={ing.quantity}
                                    style={{ maxWidth: '80px' }}
                                    onChange={e => updateIngredient(idx, 'quantity', e.target.value)} />
                                <input type="number" className="form-control" placeholder="kcal" min="0" value={ing.kcal}
                                    style={{ maxWidth: '80px' }}
                                    onChange={e => updateIngredient(idx, 'kcal', e.target.value)} />
                            </div>
                        ))}
                        <datalist id="ing-names-list">
                            {formData.allIngNames.map(n => <option key={n} value={n} />)}
                        </datalist>
                        <button type="button" className="btn btn-sm btn-light border"
                            onClick={() => setForm(f => ({ ...f, ingredients: [...f.ingredients, emptyIngredient()] }))}>
                            + Ingredient
                        </button>
                        <div className="text-muted small mt-1">Total: {totalKcal} kcal</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Tags <small className="text-muted">(separate with +++)</small></label>
                        <input list="tags-list" className="form-control" value={form.tags}
                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                        <datalist id="tags-list">
                            {formData.allTags.map(t => <option key={t} value={t} />)}
                        </datalist>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Notes</label>
                        <textarea className="form-control" rows="2" value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>

                    <button className="btn btn-secondary" disabled={!valid || loading}>
                        {loading ? 'Saving…' : isEdit ? 'Update' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}
