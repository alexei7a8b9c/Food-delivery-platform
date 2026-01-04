import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            setError(result.error || 'Login error');
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
                    <h2 className="auth-title">Login</h2>

                    {error && (
                        <div className="error-message">
                            <strong>Error:</strong> {error}
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
                                placeholder="Enter email"
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter password"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={loading || !email || !password}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="test-accounts">
                        <p className="test-credentials">
                            <strong>Admin:</strong> admin@fooddelivery.com / admin123<br/>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;