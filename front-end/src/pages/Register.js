import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCheck } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        telephone: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Полное имя обязательно';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Имя должно содержать минимум 2 символа';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Введите корректный email';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Подтверждение пароля обязательно';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        if (formData.telephone && !validatePhone(formData.telephone)) {
            newErrors.telephone = 'Введите корректный номер телефона';
        }

        return newErrors;
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[\+]?[0-9]{10,15}$/;
        return re.test(phone.replace(/[-\s]/g, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Пожалуйста, исправьте ошибки в форме');
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                telephone: formData.telephone || null,
            };

            const result = await register(userData);

            if (result.success) {
                toast.success('Регистрация успешна!');
                navigate('/');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Ошибка регистрации. Попробуйте еще раз.');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = (password) => {
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return strength;
    };

    const getPasswordStrengthColor = (strength) => {
        if (strength === 0) return '#e74c3c';
        if (strength === 1) return '#e74c3c';
        if (strength === 2) return '#f39c12';
        if (strength === 3) return '#2ecc71';
        if (strength === 4) return '#27ae60';
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Создать аккаунт</h2>
                    <p style={styles.subtitle}>Зарегистрируйтесь, чтобы начать пользоваться сервисом</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Full Name */}
                    <div style={styles.formGroup}>
                        <label htmlFor="fullName" style={styles.label}>
                            <FaUser style={styles.labelIcon} />
                            Полное имя *
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Введите ваше полное имя"
                            style={{
                                ...styles.input,
                                ...(errors.fullName && styles.inputError)
                            }}
                            disabled={isLoading}
                        />
                        {errors.fullName && (
                            <span style={styles.errorText}>{errors.fullName}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>
                            <FaEnvelope style={styles.labelIcon} />
                            Email адрес *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Введите ваш email"
                            style={{
                                ...styles.input,
                                ...(errors.email && styles.inputError)
                            }}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span style={styles.errorText}>{errors.email}</span>
                        )}
                    </div>

                    {/* Telephone */}
                    <div style={styles.formGroup}>
                        <label htmlFor="telephone" style={styles.label}>
                            <FaPhone style={styles.labelIcon} />
                            Телефон (необязательно)
                        </label>
                        <input
                            type="tel"
                            id="telephone"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            placeholder="+7 (999) 123-45-67"
                            style={{
                                ...styles.input,
                                ...(errors.telephone && styles.inputError)
                            }}
                            disabled={isLoading}
                        />
                        {errors.telephone && (
                            <span style={styles.errorText}>{errors.telephone}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>
                            <FaLock style={styles.labelIcon} />
                            Пароль *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль (минимум 6 символов)"
                            style={{
                                ...styles.input,
                                ...(errors.password && styles.inputError)
                            }}
                            disabled={isLoading}
                        />
                        {formData.password && (
                            <div style={styles.passwordStrength}>
                                <div style={styles.strengthMeter}>
                                    <div
                                        style={{
                                            ...styles.strengthBar,
                                            width: `${(passwordStrength(formData.password) / 4) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor(passwordStrength(formData.password))
                                        }}
                                    />
                                </div>
                                <div style={styles.strengthText}>
                                    Сложность пароля:
                                    <span style={{
                                        color: getPasswordStrengthColor(passwordStrength(formData.password)),
                                        fontWeight: 'bold',
                                        marginLeft: '5px'
                                    }}>
                    {passwordStrength(formData.password) === 0 && 'Очень слабый'}
                                        {passwordStrength(formData.password) === 1 && 'Слабый'}
                                        {passwordStrength(formData.password) === 2 && 'Средний'}
                                        {passwordStrength(formData.password) === 3 && 'Хороший'}
                                        {passwordStrength(formData.password) === 4 && 'Отличный'}
                  </span>
                                </div>
                            </div>
                        )}
                        {errors.password && (
                            <span style={styles.errorText}>{errors.password}</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div style={styles.formGroup}>
                        <label htmlFor="confirmPassword" style={styles.label}>
                            <FaLock style={styles.labelIcon} />
                            Подтверждение пароля *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            style={{
                                ...styles.input,
                                ...(errors.confirmPassword && styles.inputError)
                            }}
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <span style={styles.errorText}>{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div style={styles.terms}>
                        <input
                            type="checkbox"
                            id="terms"
                            style={styles.checkbox}
                            required
                        />
                        <label htmlFor="terms" style={styles.termsLabel}>
                            Я соглашаюсь с{' '}
                            <Link to="/terms" style={styles.termsLink}>условиями использования</Link>{' '}
                            и{' '}
                            <Link to="/privacy" style={styles.termsLink}>политикой конфиденциальности</Link>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div style={styles.spinnerContainer}>
                                <div style={styles.spinner}></div>
                                <span style={{ marginLeft: '10px' }}>Регистрация...</span>
                            </div>
                        ) : (
                            <>
                                <FaCheck style={{ marginRight: '10px' }} />
                                Зарегистрироваться
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div style={styles.loginLink}>
                        <p style={styles.loginText}>
                            Уже есть аккаунт?{' '}
                            <Link to="/login" style={styles.loginLinkText}>
                                Войдите здесь
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
        maxWidth: '500px',
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
    inputError: {
        borderColor: '#e74c3c',
        ':focus': {
            borderColor: '#e74c3c',
            boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.1)',
        },
    },
    errorText: {
        display: 'block',
        color: '#e74c3c',
        fontSize: '0.85rem',
        marginTop: '5px',
    },
    passwordStrength: {
        marginTop: '10px',
    },
    strengthMeter: {
        height: '5px',
        backgroundColor: '#e9ecef',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '5px',
    },
    strengthBar: {
        height: '100%',
        transition: 'all 0.3s ease',
    },
    strengthText: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
    },
    terms: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '25px',
    },
    checkbox: {
        marginRight: '10px',
        marginTop: '3px',
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    termsLabel: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        lineHeight: 1.4,
        cursor: 'pointer',
    },
    termsLink: {
        color: '#ff6b35',
        textDecoration: 'none',
        fontWeight: '600',
        ':hover': {
            textDecoration: 'underline',
        },
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
    },
    loginText: {
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    loginLinkText: {
        color: '#ff6b35',
        textDecoration: 'none',
        fontWeight: 'bold',
        ':hover': {
            textDecoration: 'underline',
        },
    },
};

export default Register;