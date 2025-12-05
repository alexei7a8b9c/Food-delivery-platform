import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, error: authError, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    useEffect(() => {
        clearError();
        setErrors({});
    }, [email, password, clearError]);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const result = await login(email, password);

            if (result.success) {
                console.log('Login successful!');
                navigate(from, { replace: true });
            } else {
                console.error('Login failed:', result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoLogin = async () => {
        setEmail('john.doe@email.com');
        setPassword('password123');

        setTimeout(async () => {
            setIsSubmitting(true);
            try {
                const result = await login('john.doe@email.com', 'password123');

                if (result.success) {
                    console.log('Demo login successful!');
                    navigate(from, { replace: true });
                }
            } catch (error) {
                console.error('Demo login failed. Please try manual login.');
            } finally {
                setIsSubmitting(false);
            }
        }, 100);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Login</h2>

                            {authError && (
                                <div className="alert alert-danger" role="alert">
                                    {authError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">{errors.password}</div>
                                    )}
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
                                                Logging in...
                                            </>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleDemoLogin}
                                        disabled={isSubmitting}
                                    >
                                        Try Demo Account
                                    </button>
                                </div>

                                <div className="text-center">
                                    <Link to="/forgot-password" className="text-decoration-none">
                                        Forgot password?
                                    </Link>
                                </div>
                            </form>

                            <hr className="my-4" />

                            <div className="text-center">
                                <p className="mb-0">Don't have an account?</p>
                                <Link to="/register" className="btn btn-link text-decoration-none">
                                    Create new account
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-3">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Demo Credentials</h6>
                            <p className="card-text small">
                                <strong>Email:</strong> john.doe@email.com<br />
                                <strong>Password:</strong> password123
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;