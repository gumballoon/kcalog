import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const UNITS = ['gram', 'millilitre', 'piece'];
const CATEGORIES = ['breakfast', 'lunch', 'snack', 'dinner'];
const emptyIngredient = () => ({ name: '', unit: 'gram', quantity: '', kcal: '' });

export default function MealLogFormPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [formData, setFormData] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState(null); // meal from DB if chosen
    const [form, setForm] = useState({
        date: '', category: 'snack', grams: '', notes: '',
        meal: { name: '', serving: 'single', ingredients: [emptyIngredient()] },
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const path = isEdit ? `/logs/meals/${id}/form-data` : '/logs/meals/form-data';
        api.get(path).then(({ today, category, allMeals, allMealNames, allIngredients, allIngNames, allTags, mealLog }) => {
            setFormData({ today, allMeals, allMealNames, allIngredients, allIngNames, allTags });
            if (mealLog) {
                setForm({
                    date: mealLog.date?.split('T')[0] || today,
                    category: mealLog.category || 'snack',
                    grams: mealLog.grams || '',
                    notes: mealLog.notes || '',
                    meal: {
                        name: mealLog.meal?.name || '',
                        serving: mealLog.meal?.serving || 'single',
                        ingredients: mealLog.meal?.ingredients?.length
                            ? mealLog.meal.ingredients.map(i => ({ name: i.name, unit: i.unit, quantity: i.quantity, kcal: i.kcal }))
                            : [emptyIngredient()],
                    },
                });
            } else {
                setForm(f => ({ ...f, date: today, category: category || 'snack' }));
            }
        });
    }, [id, isEdit]);

    const handleMealNameChange = (name) => {
        const meal = formData?.allMeals?.find(m => m.name === name);
        if (meal) {
            setSelectedMeal(meal);
            setForm(f => ({
                ...f,
                meal: {
                    name: meal.name,
                    serving: meal.serving,
                    ingredients: meal.ingredients || [],
                },
                grams: '',
            }));
        } else {
            setSelectedMeal(null);
            setForm(f => ({ ...f, meal: { ...f.meal, name } }));
        }
    };

    const updateIngredient = useCallback((idx, field, value) => {
        setForm(f => {
            const ings = [...f.meal.ingredients];
            ings[idx] = { ...ings[idx], [field]: value };
            if ((field === 'name' || field === 'quantity') && formData) {
                const ingData = formData.allIngredients.find(i => i.name === ings[idx].name);
                if (ingData && ings[idx].quantity) {
                    ings[idx].kcal = Math.round(ingData.kcalPerUnit * Number(ings[idx].quantity));
                }
            }
            return { ...f, meal: { ...f.meal, ingredients: ings } };
        });
    }, [formData]);

    const totalKcal = form.meal.serving === 'single'
        ? form.meal.ingredients.reduce((s, i) => s + (Number(i.kcal) || 0), 0)
        : selectedMeal && form.grams
            ? Math.round(selectedMeal.kcalPerGram * Number(form.grams))
            : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const mealLogBody = {
                date: form.date,
                category: form.category,
                grams: form.grams || undefined,
                notes: form.notes,
            };
            const mealBody = {
                ...form.meal,
                totalKcal,
                ingredients: form.meal.ingredients.filter(i => i.name),
            };
            const body = {
                mealLog: mealLogBody,
                meal: mealBody,
                mealData: selectedMeal ? JSON.stringify(selectedMeal) : undefined,
            };

            const { mealLog: saved, message } = isEdit
                ? await api.put(`/logs/meals/${id}`, body)
                : await api.post('/logs/meals', body);
            setFlash({ type: 'success', message });
            navigate(isEdit ? `/logs/meals/${id}` : `/logs/meals/${saved._id}`);
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div className="text-center py-5">Loading…</div>;

    const valid = form.date && form.meal.name && (form.meal.serving === 'single'
        ? form.meal.ingredients.some(i => i.name)
        : form.grams);

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
                <Link to="/logs/meals" className="btn btn-sm btn-light border mb-3">← Meal Logs</Link>
                <h2 className="mb-4">{isEdit ? 'Edit Meal Log' : 'New Meal Log'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" value={form.date} max={formData.today}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label d-block">Category</label>
                        {CATEGORIES.map(cat => (
                            <div key={cat} className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" id={`cat-${cat}`}
                                    checked={form.category === cat} onChange={() => setForm(f => ({ ...f, category: cat }))} />
                                <label className="form-check-label" htmlFor={`cat-${cat}`}>{cat}</label>
                            </div>
                        ))}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Meal Name</label>
                        <input list="meal-names-list" className="form-control" value={form.meal.name}
                            onChange={e => handleMealNameChange(e.target.value.toLowerCase())} required />
                        <datalist id="meal-names-list">
                            {formData.allMealNames.map(n => <option key={n} value={n} />)}
                        </datalist>
                    </div>

                    {form.meal.name && (
                        <>
                            {form.meal.serving === 'full' ? (
                                <div className="mb-3">
                                    <label className="form-label">Grams consumed</label>
                                    <input type="number" className="form-control" min="1" value={form.grams}
                                        onChange={e => setForm(f => ({ ...f, grams: e.target.value }))} required />
                                    {selectedMeal && form.grams && (
                                        <div className="text-muted small mt-1">≈ {totalKcal} kcal</div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <label className="form-label">Ingredients</label>
                                    {form.meal.ingredients.map((ing, idx) => (
                                        <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                                            <button type="button" className="btn btn-sm btn-light border"
                                                onClick={() => setForm(f => ({ ...f, meal: { ...f.meal, ingredients: f.meal.ingredients.filter((_, i) => i !== idx) } }))}>✕</button>
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
                                        onClick={() => setForm(f => ({ ...f, meal: { ...f.meal, ingredients: [...f.meal.ingredients, emptyIngredient()] } }))}>
                                        + Ingredient
                                    </button>
                                    <div className="text-muted small mt-1">Total: {totalKcal} kcal</div>
                                </div>
                            )}
                        </>
                    )}

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
