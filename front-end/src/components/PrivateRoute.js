import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRoles.length > 0) {
        const userRoles = user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return (
                <div style={styles.accessDenied}>
                    <h2>Доступ запрещен</h2>
                    <p>У вас нет прав для доступа к этой странице.</p>
                </div>
            );
        }
    }

    return children;
};

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: '20px',
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        borderLeftColor: '#ff6b35',
        animation: 'spin 1s ease infinite',
    },
    accessDenied: {
        textAlign: 'center',
        padding: '50px 20px',
        maxWidth: '600px',
        margin: '0 auto',
    },
};

export default PrivateRoute;