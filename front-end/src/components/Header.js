import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/common.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItems = [] } = useCart(); // Значение по умолчанию
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Лого */}
                    <div className="logo">
                        <Link to="/">
                            <h1>FoodDelivery</h1>
                        </Link>
                    </div>

                    {/* Навигация */}
                    <nav className="nav">
                        <Link to="/" className="nav-link">Главная</Link>
                        <Link to="/restaurants" className="nav-link">Рестораны</Link>
                        <Link to="/menu" className="nav-link">Все блюда</Link>

                        {user && (
                            <>
                                <Link to="/orders" className="nav-link">Мои заказы</Link>
                                {(user.roles && user.roles.includes('ADMIN')) && (
                                    <Link to="/admin" className="nav-link">Админ</Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Правая часть */}
                    <div className="header-right">
                        {/* Корзина */}
                        <Link to="/cart" className="cart-link">
                            <span className="cart-icon">🛒</span>
                            {Array.isArray(cartItems) && cartItems.length > 0 && ( // Проверяем что это массив
                                <span className="cart-count">{cartItems.length}</span>
                            )}
                        </Link>

                        {/* Профиль */}
                        {user ? (
                            <div className="user-menu">
                                <span className="user-name">{user.fullName || user.email}</span>
                                <div className="dropdown">
                                    <Link to="/profile" className="dropdown-item">Профиль</Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-outline">Войти</Link>
                                <Link to="/register" className="btn btn-primary">Регистрация</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;