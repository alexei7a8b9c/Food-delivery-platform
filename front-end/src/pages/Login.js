import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook, FaUserPlus } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Пожалуйста, заполните все поля');
            return;
        }

        if (!validateEmail(email)) {
            toast.error('Пожалуйста, введите корректный email');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                toast.success('Вход выполнен успешно!');

                // Сохраняем remember me
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Перенаправляем на главную
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Ошибка входа. Проверьте данные.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSocialLogin = (provider) => {
        toast.info(`Вход через ${provider} в разработке`);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Вход в аккаунт</h2>
                    <p style={styles.subtitle}>Войдите, чтобы продолжить</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>
                            <FaEnvelope style={styles.labelIcon} />
                            Email адрес
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите ваш email"
                            style={styles.input}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <div style={styles.passwordHeader}>
                            <label htmlFor="password" style={styles.label}>
                                <FaLock style={styles.labelIcon} />
                                Пароль
                            </label>
                            <Link to="/forgot-password" style={styles.forgotLink}>
                                Забыли пароль?
                            </Link>
                        </div>
                        <div style={styles.passwordInputContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите ваш пароль"
                                style={styles.passwordInput}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.showPasswordBtn}
                                disabled={isLoading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div style={styles.rememberMe}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={styles.checkbox}
                            disabled={isLoading}
                        />
                        <label htmlFor="rememberMe" style={styles.checkboxLabel}>
                            Запомнить меня
                        </label>
                    </div>

                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div style={styles.spinnerContainer}>
                                <div style={styles.spinner}></div>
                                <span style={{ marginLeft: '10px' }}>Вход...</span>
                            </div>
                        ) : (
                            'Войти'
                        )}
                    </button>

                    <div style={styles.divider}>
                        <span style={styles.dividerText}>или войдите через</span>
                    </div>

                    <div style={styles.socialButtons}>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('Google')}
                            style={styles.socialButton}
                            disabled={isLoading}
                        >
                            <FaGoogle style={styles.socialIcon} />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('Facebook')}
                            style={styles.socialButton}
                            disabled={isLoading}
                        >
                            <FaFacebook style={styles.socialIcon} />
                            Facebook
                        </button>
                    </div>

                    <div style={styles.registerLink}>
                        <p style={styles.registerText}>
                            Нет аккаунта?{' '}
                            <Link to="/register" style={styles.registerLinkText}>
                                <FaUserPlus style={{ marginRight: '5px' }} />
                                Зарегистрируйтесь
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '20px',
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '0.95rem',
    },
    form: {
        width: '100%',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    labelIcon: {
        marginRight: '8px',
        color: '#ff6b35',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#ff6b35',
            boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
        },
    },
    passwordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    forgotLink: {
        fontSize: '0.85rem',
        color: '#ff6b35',
        textDecoration: 'none',
        fontWeight: '600',
        ':hover': {
            textDecoration: 'underline',
        },
    },
    passwordInputContainer: {
        position: 'relative',
    },
    passwordInput: {
        width: '100%',
        padding: '12px 45px 12px 15px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#ff6b35',
            boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
        },
    },
    showPasswordBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        color: '#7f8c8d',
        padding: '5px',
        ':hover': {
            color: '#ff6b35',
        },
    },
    rememberMe: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '25px',
    },
    checkbox: {
        marginRight: '10px',
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        cursor: 'pointer',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '20px',
        ':hover': {
            backgroundColor: '#e55a2e',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
        },
        ':disabled': {
            backgroundColor: '#95a5a6',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
        },
    },
    spinnerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '25px 0',
        '::before, ::after': {
            content: '""',
            flex: 1,
            height: '1px',
            backgroundColor: '#e9ecef',
        },
    },
    dividerText: {
        padding: '0 15px',
        color: '#7f8c8d',
        fontSize: '0.85rem',
        backgroundColor: 'white',
    },
    socialButtons: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
    },
    socialButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        backgroundColor: 'white',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
            transform: 'translateY(-2px)',
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            transform: 'none',
        },
    },
    socialIcon: {
        fontSize: '1.2rem',
    },
    registerLink: {
        textAlign: 'center',
        marginTop: '20px',
    },
    registerText: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    registerLinkText: {
        color: '#ff6b35',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        ':hover': {
            textDecoration: 'underline',
        },
    },
};

export default Login;