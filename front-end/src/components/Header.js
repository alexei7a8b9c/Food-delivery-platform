import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Header = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Функция для проверки ролей
    const hasAdminOrManagerRole = () => {
        if (!currentUser || !currentUser.roles) return false;

        let roles = [];
        if (Array.isArray(currentUser.roles)) {
            roles = currentUser.roles;
        } else if (typeof currentUser.roles === 'string') {
            roles = currentUser.roles.split(',').map(r => r.trim());
        }

        // Проверяем роли с поддержкой префикса ROLE_
        const normalizedRoles = roles.map(role => {
            const roleStr = String(role).toUpperCase();
            if (roleStr.startsWith('ROLE_')) {
                return roleStr.substring(5);
            }
            return roleStr;
        });

        return normalizedRoles.includes('ADMIN') || normalizedRoles.includes('MANAGER');
    };

    return (
        <div style={{
            borderBottom: '2px solid black',
            padding: '10px 20px',
            backgroundColor: 'white'
        }}>
            <h1 style={{ margin: '0 0 10px 0' }}>Food Delivery Platform</h1>
            <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Link to="/">Home</Link>
                <Link to="/restaurants">Restaurants</Link>
                <Link to="/menu">Menu</Link>
                <Link to="/cart">Cart {cartCount > 0 && `(${cartCount})`}</Link>

                {currentUser ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <Link to="/orders">My Orders</Link>
                        {hasAdminOrManagerRole() && (
                            <Link to="/admin">Admin Panel</Link>
                        )}
                        <span style={{ marginLeft: 'auto' }}>
              Logged in as: <strong>{currentUser.email}</strong>
            </span>
                        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <span style={{ marginLeft: 'auto' }}></span>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Header;