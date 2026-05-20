import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FlashToast from './components/FlashToast';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DailyLogsPage from './pages/DailyLogsPage';
import DailyLogShowPage from './pages/DailyLogShowPage';
import MealLogsPage from './pages/MealLogsPage';
import MealLogShowPage from './pages/MealLogShowPage';
import MealLogFormPage from './pages/MealLogFormPage';
import WorkoutLogsPage from './pages/WorkoutLogsPage';
import WorkoutLogShowPage from './pages/WorkoutLogShowPage';
import WorkoutLogFormPage from './pages/WorkoutLogFormPage';
import MealsPage from './pages/MealsPage';
import MealShowPage from './pages/MealShowPage';
import MealFormPage from './pages/MealFormPage';
import IngredientsPage from './pages/IngredientsPage';
import IngredientFormPage from './pages/IngredientFormPage';

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    if (currentUser === undefined) return null; // still loading
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
}

function GuestRoute({ children }) {
    const { currentUser } = useAuth();
    if (currentUser === undefined) return null;
    if (currentUser) return <Navigate to="/" replace />;
    return children;
}

function AppLayout() {
    const [flash, setFlash] = useState(null);
    const clearFlash = useCallback(() => setFlash(null), []);

    return (
        <>
            <Navbar />
            <div className="container-fluid py-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
                <FlashToast flash={flash} onClear={clearFlash} />
                <Routes>
                    <Route path="/" element={<ProtectedRoute><HomePage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/login" element={<GuestRoute><LoginPage setFlash={setFlash} /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><RegisterPage setFlash={setFlash} /></GuestRoute>} />

                    <Route path="/logs" element={<ProtectedRoute><DailyLogsPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/today" element={<ProtectedRoute><DailyLogShowPage today setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/:id" element={<ProtectedRoute><DailyLogShowPage setFlash={setFlash} /></ProtectedRoute>} />

                    <Route path="/logs/meals" element={<ProtectedRoute><MealLogsPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/meals/new" element={<ProtectedRoute><MealLogFormPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/meals/:id" element={<ProtectedRoute><MealLogShowPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/meals/:id/edit" element={<ProtectedRoute><MealLogFormPage setFlash={setFlash} /></ProtectedRoute>} />

                    <Route path="/logs/workouts" element={<ProtectedRoute><WorkoutLogsPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/workouts/new" element={<ProtectedRoute><WorkoutLogFormPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/workouts/:id" element={<ProtectedRoute><WorkoutLogShowPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/logs/workouts/:id/edit" element={<ProtectedRoute><WorkoutLogFormPage setFlash={setFlash} /></ProtectedRoute>} />

                    <Route path="/db/meals" element={<ProtectedRoute><MealsPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/db/meals/new" element={<ProtectedRoute><MealFormPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/db/meals/:id" element={<ProtectedRoute><MealShowPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/db/meals/:id/edit" element={<ProtectedRoute><MealFormPage setFlash={setFlash} /></ProtectedRoute>} />

                    <Route path="/db/ingredients" element={<ProtectedRoute><IngredientsPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/db/ingredients/new" element={<ProtectedRoute><IngredientFormPage setFlash={setFlash} /></ProtectedRoute>} />
                    <Route path="/db/ingredients/:id/edit" element={<ProtectedRoute><IngredientFormPage setFlash={setFlash} /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </BrowserRouter>
    );
}
