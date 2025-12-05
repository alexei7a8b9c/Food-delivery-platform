import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Сохраняем текущий путь для редиректа после входа
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Проверка ролей, если указаны
    if (roles.length > 0 && user) {
        const userRoles = user.roles || [];
        const hasRequiredRole = roles.some(role =>
            userRoles.includes(role) || userRoles.map(r => r.name).includes(role)
        );

        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default PrivateRoute;