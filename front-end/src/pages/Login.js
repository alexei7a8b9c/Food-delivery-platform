import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('admin@fooddelivery.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('Login attempt with:', { email, password });

        const result = await login(email, password);

        console.log('Login result:', result);

        if (result.success) {
            console.log('Login successful, navigating to /');
            navigate('/');
        } else {
            setError(result.error || 'Ошибка входа');
            console.error('Login failed:', result.error);
        }

        setLoading(false);
    };

    const useTestAccount = (type) => {
        switch(type) {
            case 'admin':
                setEmail('admin@fooddelivery.com');
                setPassword('admin123');
                break;
            case 'user':
                setEmail('user@example.com');
                setPassword('user123');
                break;
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h2 className="auth-title">Вход в систему (Debug Mode)</h2>

                    {error && (
                        <div className="error-message">
                            <strong>Ошибка:</strong> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Введите email"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Введите пароль"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : 'Войти (с отладкой)'}
                        </button>
                    </form>

                    <div className="test-accounts">
                        <h4>Тестовые аккаунты:</h4>
                        <div className="test-buttons">
                            <button
                                type="button"
                                onClick={() => useTestAccount('admin')}
                                className="btn btn-test"
                            >
                                Администратор
                            </button>
                            <button
                                type="button"
                                onClick={() => useTestAccount('user')}
                                className="btn btn-test"
                            >
                                Пользователь
                            </button>
                        </div>
                        <p className="test-credentials">
                            <strong>Админ:</strong> admin@fooddelivery.com / admin123<br/>
                            <strong>Пользователь:</strong> user@example.com / user123
                        </p>
                    </div>

                    <div className="debug-tips">
                        <h4>Если не работает:</h4>
                        <ol>
                            <li>Откройте консоль браузера (F12)</li>
                            <li>Посмотрите Network → login запрос</li>
                            <li>Проверьте Response от сервера</li>
                            <li>Скопируйте токен и проверьте на <a href="https://jwt.io" target="_blank" rel="noreferrer">jwt.io</a></li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;