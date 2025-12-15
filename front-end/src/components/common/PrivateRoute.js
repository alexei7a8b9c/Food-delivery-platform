import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading, user, refreshUserData } = useAuth();

    console.log('=== PrivateRoute Debug ===');
    console.log('User object:', user);
    console.log('isAuthenticated:', isAuthenticated());
    console.log('isAdmin:', isAdmin());
    console.log('adminOnly:', adminOnly);
    console.log('Loading:', loading);
    console.log('=========================');

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!isAuthenticated()) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin()) {
        console.log('Access denied - not admin');
        return (
            <div className="access-denied">
                <h2>⚠️ Доступ запрещен</h2>
                <p>Только администраторы могут просматривать эту страницу.</p>

                <div className="debug-info">
                    <h3>Отладочная информация:</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Роли в localStorage:</strong> {JSON.stringify(user?.roles)}</p>
                    <p><strong>Токен:</strong> {user?.token ? 'Есть' : 'Нет'}</p>

                    <button
                        onClick={() => {
                            console.log('Current user:', user);
                            console.log('Token:', localStorage.getItem('token'));
                            refreshUserData();
                            window.location.reload();
                        }}
                        className="btn btn-debug"
                    >
                        Обновить данные
                    </button>
                </div>

                <div className="solutions">
                    <h3>Возможные решения:</h3>
                    <ol>
                        <li>Выйти и войти снова</li>
                        <li>Проверить, что вы используете админский аккаунт</li>
                        <li>Проверить консоль браузера (F12)</li>
                    </ol>
                </div>

                <div className="actions">
                    <a href="/" className="btn">На главную</a>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }} className="btn btn-logout">
                        Выйти и войти снова
                    </button>
                </div>
            </div>
        );
    }

    console.log('Access granted to private route');
    return children;
};

export default PrivateRoute;