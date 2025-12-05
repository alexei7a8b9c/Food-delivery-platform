import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        telephone: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const { register, checkEmailAvailability, error: authError, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Перенаправляем если уже аутентифицирован
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Очищаем ошибки при изменении полей
    useEffect(() => {
        clearError();
        setErrors({});
    }, [formData, clearError]);

    // Проверка email на доступность
    useEffect(() => {
        const checkEmail = async () => {
            if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
                setEmailAvailable(null);
                return;
            }

            const debounceTimer = setTimeout(async () => {
                setCheckingEmail(true);
                try {
                    const result = await checkEmailAvailability(formData.email);
                    setEmailAvailable(result.available);
                } catch (error) {
                    setEmailAvailable(null);
                } finally {
                    setCheckingEmail(false);
                }
            }, 500);

            return () => clearTimeout(debounceTimer);
        };

        checkEmail();
    }, [formData.email, checkEmailAvailability]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Очищаем ошибку для поля при изменении
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        } else if (emailAvailable === false) {
            newErrors.email = 'Email is already taken';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                telephone: formData.telephone || undefined
            };

            const result = await register(userData);

            if (result.success) {
                toast.success('Registration successful!');
                navigate('/', { replace: true });
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Create Account</h2>

                            {authError && (
                                <div className="alert alert-danger" role="alert">
                                    {authError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="fullName" className="form-label">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {errors.fullName && (
                                            <div className="invalid-feedback">{errors.fullName}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${
                                                errors.email ? 'is-invalid' :
                                                    emailAvailable === true ? 'is-valid' :
                                                        emailAvailable === false ? 'is-invalid' : ''
                                            }`}
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        <div className="d-flex justify-content-between">
                                            {errors.email && (
                                                <div className="invalid-feedback d-block">{errors.email}</div>
                                            )}
                                            {checkingEmail && (
                                                <small className="text-muted">Checking email...</small>
                                            )}
                                            {emailAvailable === true && !checkingEmail && (
                                                <small className="text-success">Email is available</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password" className="form-label">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback">{errors.password}</div>
                                        )}
                                        <small className="text-muted">At least 6 characters</small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm Password *
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="telephone" className="form-label">
                                        Telephone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="telephone"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        placeholder="+1-555-123-4567"
                                    />
                                </div>

                                <div className="d-grid gap-2 mb-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <p className="mb-0">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-decoration-none">
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Account Information</h6>
                            <p className="card-text small">
                                Your account will be created with the default USER role.
                                After registration, you can login and access the platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;