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
                <p>Loading...</p>
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
                <h2>⚠️ Access Denied</h2>
                <p>Only administrators can view this page.</p>

                <div className="debug-info">
                    <h3>Debug Information:</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Roles in localStorage:</strong> {JSON.stringify(user?.roles)}</p>
                    <p><strong>Token:</strong> {user?.token ? 'Present' : 'Missing'}</p>

                    <button
                        onClick={() => {
                            console.log('Current user:', user);
                            console.log('Token:', localStorage.getItem('token'));
                            refreshUserData();
                            window.location.reload();
                        }}
                        className="btn btn-debug"
                    >
                        Refresh Data
                    </button>
                </div>

                <div className="solutions">
                    <h3>Possible Solutions:</h3>
                    <ol>
                        <li>Log out and log in again</li>
                        <li>Check that you are using an admin account</li>
                        <li>Check the browser console (F12)</li>
                    </ol>
                </div>

                <div className="actions">
                    <a href="/" className="btn">Go to Home</a>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }} className="btn btn-logout">
                        Log out and log in again
                    </button>
                </div>
            </div>
        );
    }

    console.log('Access granted to private route');
    return children;
};

export default PrivateRoute;