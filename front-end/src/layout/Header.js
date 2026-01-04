import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="logo">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">🍽️ Restaurant and dishes</span>
                    </Link>
                </div>

                <nav className="nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>

                    {isAuthenticated() && isAdmin() && (
                        <Link
                            to="/admin"
                            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                        >
                            Admin
                        </Link>
                    )}

                    {!isAuthenticated() ? (
                        <>
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <div className="user-menu">
                            <span className="user-email">{user?.email}</span>
                            <button onClick={handleLogout} className="btn btn-logout">
                                Logout
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;