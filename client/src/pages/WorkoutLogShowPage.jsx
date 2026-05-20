import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function WorkoutLogShowPage({ setFlash }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workoutLog, setWorkoutLog] = useState(null);

    useEffect(() => {
        api.get(`/logs/workouts/${id}`).then(({ workoutLog }) => setWorkoutLog(workoutLog));
    }, [id]);

    const handleDelete = async () => {
        try {
            const { message } = await api.delete(`/logs/workouts/${id}`);
            setFlash({ type: 'success', message });
            navigate('/logs/workouts');
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        }
    };

    if (!workoutLog) return <div className="text-center py-5">Loading…</div>;

    return (
        <div>
            <Link to="/logs/workouts" className="btn btn-sm btn-light border mb-3">← All Workout Logs</Link>
            <h2 className="text-capitalize">{workoutLog.name}</h2>
            <div className="text-muted mb-2">{workoutLog.longDate}</div>

            <div className="d-flex gap-4 border rounded p-3 mb-3">
                <div><span className="fw-bold">{workoutLog.kcal}</span> <small>kcal burned</small></div>
                {workoutLog.duration !== '00:00' && (
                    <div><span className="fw-bold">{workoutLog.duration}</span> <small>duration</small></div>
                )}
                {workoutLog.kcalPerHour > 0 && (
                    <div><span className="fw-bold">{workoutLog.kcalPerHour}</span> <small>kcal/h</small></div>
                )}
            </div>

            {workoutLog.notes && <p className="text-muted">{workoutLog.notes}</p>}

            <div className="d-flex gap-2 mt-3">
                <Link to={`/logs/workouts/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
            </div>

            <DeleteConfirmModal id="deleteModal" name="Workout Log" onConfirm={handleDelete} />
        </div>
    );
}
