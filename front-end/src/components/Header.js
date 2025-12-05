import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUtensils, FaHome, FaListAlt, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Вы успешно вышли из системы');
        navigate('/');
    };

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="header" style={styles.header}>
            <nav className="navbar" style={styles.navbar}>
                <div className="container" style={styles.container}>
                    <Link to="/" className="logo" style={styles.logo}>
                        <FaUtensils style={{ marginRight: '10px' }} />
                        <span style={styles.logoText}>Food Delivery</span>
                    </Link>

                    <div className="nav-links" style={styles.navLinks}>
                        <Link to="/" style={styles.navLink}>
                            <FaHome style={{ marginRight: '5px' }} />
                            Главная
                        </Link>
                        <Link to="/restaurants" style={styles.navLink}>
                            <FaUtensils style={{ marginRight: '5px' }} />
                            Рестораны
                        </Link>

                        {user ? (
                            <>
                                <Link to="/orders" style={styles.navLink}>
                                    <FaListAlt style={{ marginRight: '5px' }} />
                                    Мои заказы
                                </Link>

                                {user.roles && user.roles.includes('ROLE_ADMIN') && (
                                    <Link to="/admin" style={styles.navLink}>
                                        <FaCog style={{ marginRight: '5px' }} />
                                        Админ панель
                                    </Link>
                                )}

                                <div className="user-info" style={styles.userInfo}>
                                    <Link to="/profile" style={styles.navLink}>
                                        <FaUser style={{ marginRight: '5px' }} />
                                        {user.fullName || user.email}
                                    </Link>

                                    <Link to="/cart" style={styles.cartLink}>
                                        <FaShoppingCart style={{ marginRight: '5px' }} />
                                        Корзина
                                        {cartItemCount > 0 && (
                                            <span className="cart-badge" style={styles.cartBadge}>
                        {cartItemCount}
                      </span>
                                        )}
                                    </Link>

                                    <button onClick={handleLogout} style={styles.logoutBtn}>
                                        <FaSignOutAlt style={{ marginRight: '5px' }} />
                                        Выйти
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="auth-links" style={styles.authLinks}>
                                <Link to="/login" style={styles.loginBtn}>
                                    <FaUser style={{ marginRight: '5px' }} />
                                    Войти
                                </Link>
                                <Link to="/register" style={styles.registerBtn}>
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

const styles = {
    header: {
        backgroundColor: '#2c3e50',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    navbar: {
        padding: '15px 0',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    logoText: {
        fontSize: '1.5rem',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginLeft: '10px',
    },
    cartLink: {
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#ff6b35',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: '#e74c3c',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    authLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    loginBtn: {
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#3498db',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
    },
    registerBtn: {
        color: 'white',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#2ecc71',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
    },
};

// Add hover effects
Object.assign(styles.navLink, {
    ':hover': {
        backgroundColor: '#34495e',
    },
});
Object.assign(styles.cartLink, {
    ':hover': {
        backgroundColor: '#e55a2e',
    },
});
Object.assign(styles.logoutBtn, {
    ':hover': {
        backgroundColor: '#c0392b',
    },
});
Object.assign(styles.loginBtn, {
    ':hover': {
        backgroundColor: '#2980b9',
    },
});
Object.assign(styles.registerBtn, {
    ':hover': {
        backgroundColor: '#27ae60',
    },
});

export default Header;