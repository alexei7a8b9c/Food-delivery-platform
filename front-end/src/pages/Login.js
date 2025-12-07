import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем redirect URL из query параметров
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect') || '/';

    // Если пользователь уже авторизован, редиректим
    useEffect(() => {
        if (currentUser) {
            navigate(redirectUrl);
        }
    }, [currentUser, navigate, redirectUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(redirectUrl);
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Функции для тестовых учетных данных (вынесены из колбэков)
    const useAdminAccount = () => {
        setEmail('admin@fooddelivery.com');
        setPassword('admin123');
    };

    const useUserAccount = () => {
        setEmail('user@example.com');
        setPassword('user123');
    };

    const useManagerAccount = () => {
        setEmail('manager@example.com');
        setPassword('manager123');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Login</h2>

            {error && (
                <div style={{
                    border: '1px solid red',
                    backgroundColor: '#ffebee',
                    padding: '10px',
                    margin: '10px 0'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px' }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div style={{ marginTop: '20px' }}>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
                    <p><strong>Test Accounts:</strong></p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={useAdminAccount}
                            style={{ fontSize: '12px', padding: '5px' }}
                        >
                            Use Admin Account
                        </button>
                        <button
                            type="button"
                            onClick={useUserAccount}
                            style={{ fontSize: '12px', padding: '5px' }}
                        >
                            Use User Account
                        </button>
                        <button
                            type="button"
                            onClick={useManagerAccount}
                            style={{ fontSize: '12px', padding: '5px' }}
                        >
                            Use Manager Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;