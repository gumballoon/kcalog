export default function StatsDisplay({ mealKcal = 0, workoutKcal = 0, balance = 0 }) {
    return (
        <div className="d-flex justify-content-around text-center my-3">
            <div>
                <div className="fw-bold fs-4">{mealKcal}</div>
                <small className="text-muted">meal kcal</small>
            </div>
            <div>
                <div className="fw-bold fs-4">{workoutKcal}</div>
                <small className="text-muted">workout kcal</small>
            </div>
            <div>
                <div className="fw-bold fs-4">{balance}</div>
                <small className="text-muted">balance</small>
            </div>
        </div>
    );
}
