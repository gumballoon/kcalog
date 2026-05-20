import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ setFlash }) {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const valid = form.username.trim() && form.email.trim() && form.password.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { message } = await register(form.username, form.email, form.password);
            setFlash({ type: 'success', message });
            navigate('/');
        } catch (err) {
            setFlash({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-10 col-md-8 col-lg-6">
                <h2 className="mb-4">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input className="form-control text-center" placeholder="username" value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                        <input type="email" className="form-control text-center" placeholder="email" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control text-center" placeholder="password" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                    <button className="btn btn-secondary w-100" disabled={!valid || loading}>
                        {loading ? 'Registering…' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
