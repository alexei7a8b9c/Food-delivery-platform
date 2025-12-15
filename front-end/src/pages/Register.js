import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        telephone: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Валидация
        if (formData.password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (formData.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Введите корректный email');
            return;
        }

        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Ошибка регистрации');
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-card">
                    <h2 className="auth-title">Регистрация</h2>

                    {error && (
                        <div className="error-message">
                            <strong>Ошибка:</strong> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Полное имя</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Введите ваше имя"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Введите email"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Пароль (минимум 6 символов)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="Введите пароль"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Подтверждение пароля</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Повторите пароль"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Телефон (необязательно)</label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                placeholder="Введите телефон"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>

                    <div className="auth-links">
                        <p>
                            Уже есть аккаунт? <Link to="/login">Войти</Link>
                        </p>
                        <p>
                            Вернуться на <Link to="/">главную</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;