import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
    const { currentUser, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0) {
        const userRoles = currentUser.roles || [];
        const hasRequiredRole = roles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return <Navigate to="/" />;
        }
    }

    return children;
};

export default PrivateRoute;