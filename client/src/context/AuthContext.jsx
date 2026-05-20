import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading

    useEffect(() => {
        api.get('/auth/me')
            .then(({ user }) => setCurrentUser(user))
            .catch(() => setCurrentUser(null));
    }, []);

    const login = async (username, password) => {
        const { user, message } = await api.post('/auth/login', { username, password });
        setCurrentUser(user);
        return { user, message };
    };

    const register = async (username, email, password) => {
        const { user, message } = await api.post('/auth/register', { username, email, password });
        setCurrentUser(user);
        return { user, message };
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
