import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">KCALOG</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link className="nav-link" to="/logs/meals">Meal Logs</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/logs/workouts">Workout Logs</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/logs">Daily Logs</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/db/meals">Meals DB</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/db/ingredients">Ingredients DB</Link></li>
                    </ul>
                    <ul className="navbar-nav">
                        {currentUser ? (
                            <>
                                <li className="nav-item"><span className="nav-link">{currentUser.username}</span></li>
                                <li className="nav-item">
                                    <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
