import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const [ordersCount, setOrdersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchOrdersCount();
        }
    }, [currentUser]);

    const fetchOrdersCount = async () => {
        try {
            const response = await api.get('/api/orders');
            setOrdersCount(response.data.length);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Функция для декодирования JWT
    const decodeAndDisplayJWT = () => {
        if (!currentUser?.accessToken) return null;

        try {
            const base64Url = currentUser.accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);
            return (
                <div style={{ marginTop: '20px', border: '1px solid black', padding: '10px', fontSize: '12px' }}>
                    <h4>JWT Token Info:</h4>
                    <p><strong>Subject (sub):</strong> {decoded.sub}</p>
                    <p><strong>User ID:</strong> {decoded.userId || 'Not found'}</p>
                    <p><strong>Email:</strong> {decoded.email || 'Not found'}</p>
                    <p><strong>Roles (raw):</strong> {JSON.stringify(decoded.roles)}</p>
                    <p><strong>Authorities:</strong> {JSON.stringify(decoded.authorities)}</p>
                    <p><strong>Expires:</strong> {new Date(decoded.exp * 1000).toLocaleString()}</p>
                    <p><strong>Issued At:</strong> {new Date(decoded.iat * 1000).toLocaleString()}</p>
                </div>
            );
        } catch (error) {
            return <p>Error decoding JWT: {error.message}</p>;
        }
    };

    if (!currentUser) {
        return <div>Please login to view profile</div>;
    }

    return (
        <div>
            <h2>Profile</h2>

            <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                <h3>User Information</h3>
                <p><strong>User ID:</strong> {currentUser.userId || 'N/A'}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Full Name:</strong> {currentUser.fullName || currentUser.email}</p>

                <div style={{ margin: '15px 0' }}>
                    <h4>Roles Information:</h4>
                    <p><strong>Raw roles data:</strong> {JSON.stringify(currentUser.roles)}</p>
                    <p><strong>Roles array:</strong> {Array.isArray(currentUser.roles) ? currentUser.roles.join(', ') : 'Not an array'}</p>
                    <p><strong>Has ADMIN role:</strong> {currentUser.roles?.includes('ADMIN') || currentUser.roles?.includes('ROLE_ADMIN') ? 'YES' : 'NO'}</p>
                    <p><strong>Has MANAGER role:</strong> {currentUser.roles?.includes('MANAGER') || currentUser.roles?.includes('ROLE_MANAGER') ? 'YES' : 'NO'}</p>
                    <p><strong>Has USER role:</strong> {currentUser.roles?.includes('USER') || currentUser.roles?.includes('ROLE_USER') ? 'YES' : 'NO'}</p>
                </div>

                <div style={{ margin: '15px 0' }}>
                    <h4>Statistics:</h4>
                    <p><strong>Orders placed:</strong> {loading ? 'Loading...' : ordersCount}</p>
                </div>

                <button onClick={logout} style={{ marginTop: '10px' }}>
                    Logout
                </button>
            </div>

            {/* Debug информация */}
            <div style={{ marginTop: '20px', border: '1px solid black', padding: '10px', fontSize: '12px' }}>
                <h4>Debug Information:</h4>
                <button onClick={() => {
                    console.log('Current user object:', currentUser);
                    console.log('LocalStorage user:', localStorage.getItem('user'));
                    console.log('Access token:', currentUser.accessToken);
                }}>
                    Log User Data to Console
                </button>
                <p><strong>Access Token (first 50 chars):</strong> {currentUser.accessToken?.substring(0, 50)}...</p>
                <p><strong>User object keys:</strong> {Object.keys(currentUser).join(', ')}</p>
            </div>

            {/* Отображение декодированного JWT */}
            {decodeAndDisplayJWT()}
        </div>
    );
};

export default Profile;