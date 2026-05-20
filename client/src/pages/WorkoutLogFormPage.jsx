import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function WorkoutLogFormPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [formData, setFormData] = useState(null);
    const [form, setForm] = useState({ name: '', kcal: '', duration: '00:00', date: '', notes: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const path = isEdit ? `/logs/workouts/${id}/form-data` : '/logs/workouts/form-data';
        api.get(path).then(({ today, allWorkouts, workoutLog }) => {
            setFormData({ today, allWorkouts });
            if (workoutLog) {
                setForm({
                    name: workoutLog.name || '',
                    kcal: workoutLog.kcal || '',
                    duration: workoutLog.duration || '00:00',
                    date: workoutLog.date?.split('T')[0] || today,
                    notes: workoutLog.notes || '',
                });
            } else {
                setForm(f => ({ ...f, date: today }));
            }
        });
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const body = { workoutLog: form };
            const { message } = isEdit
                ? await api.put(`/logs/workouts/${id}`, body)
                : await api.post('/logs/workouts', body);
            setFlash({ type: 'success', message });
            navigate(isEdit ? `/logs/workouts/${id}` : '/logs/workouts');
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div className="text-center py-5">Loading…</div>;

    const valid = form.name.trim();

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <Link to="/logs/workouts" className="btn btn-sm btn-light border mb-3">← All Workout Logs</Link>
                <h2 className="mb-4">{isEdit ? 'Edit Workout Log' : 'New Workout Log'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" value={form.date} max={formData.today}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Workout</label>
                        <input list="workouts-list" className="form-control" placeholder="workout name" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        <datalist id="workouts-list">
                            {formData.allWorkouts.map(w => <option key={w} value={w} />)}
                        </datalist>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Kcal burned</label>
                        <input type="number" className="form-control" min="0" value={form.kcal}
                            onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Duration (HH:MM)</label>
                        <input type="time" className="form-control" value={form.duration}
                            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
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
