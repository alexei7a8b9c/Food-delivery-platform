import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [activeTab, setActiveTab] = useState('test');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [testResult, setTestResult] = useState('');

    // Простая форма для тестирования
    const [testData, setTestData] = useState({
        name: 'Test Restaurant',
        cuisine: 'Test Cuisine',
        address: 'Test Address 123'
    });

    // Проверяем роли
    const hasAdminOrManagerRole = () => {
        if (!currentUser || !currentUser.roles) return false;

        let roles = [];
        if (Array.isArray(currentUser.roles)) {
            roles = currentUser.roles;
        } else if (typeof currentUser.roles === 'string') {
            roles = currentUser.roles.split(',').map(r => r.trim());
        }

        const normalizedRoles = roles.map(role => {
            const roleStr = String(role).toUpperCase();
            if (roleStr.startsWith('ROLE_')) {
                return roleStr.substring(5);
            }
            return roleStr;
        });

        return normalizedRoles.includes('ADMIN') || normalizedRoles.includes('MANAGER');
    };

    // Тест 1: Простой GET запрос к админ эндпоинту
    const testAdminGET = async () => {
        try {
            setTestResult('Testing GET /api/admin/restaurants...');
            const response = await api.get('/api/admin/restaurants');
            setTestResult(`GET Success! Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            setTestResult(`GET Error: ${error.response?.status || error.message}. Data: ${JSON.stringify(error.response?.data)}`);
        }
    };

    // Тест 2: Простой POST запрос с минимальными данными
    const testAdminPOST = async () => {
        try {
            setTestResult('Testing POST /api/admin/restaurants...');

            // Минимальные данные, которые должен принимать сервер
            const minimalData = {
                name: testData.name,
                cuisine: testData.cuisine,
                address: testData.address
            };

            console.log('Sending POST with data:', minimalData);

            const response = await api.post('/api/admin/restaurants', minimalData);
            setTestResult(`POST Success! Status: ${response.status}, ID: ${response.data.id}`);

            // Обновляем список ресторанов
            fetchRestaurants();
        } catch (error) {
            console.error('POST Error details:', error);
            console.error('Response data:', error.response?.data);
            console.error('Response headers:', error.response?.headers);

            setTestResult(`POST Error ${error.response?.status}: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    // Тест 3: Проверка headers
    const testHeaders = async () => {
        try {
            // Делаем простой запрос к публичному эндпоинту для проверки headers
            const response = await api.get('/api/restaurants');
            const headers = response.config.headers;

            setTestResult(`Headers check: Authorization=${headers.Authorization ? 'Present' : 'Missing'}, X-User-Id=${headers['X-User-Id'] || 'Missing'}`);
        } catch (error) {
            setTestResult(`Headers check error: ${error.message}`);
        }
    };

    // Тест 4: Сырой fetch запрос для сравнения
    const testRawFetch = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.accessToken;

            setTestResult('Testing raw fetch...');

            const response = await fetch('http://localhost:8080/api/admin/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testData)
            });

            const data = await response.text();
            setTestResult(`Raw Fetch: Status ${response.status}, Response: ${data}`);
        } catch (error) {
            setTestResult(`Raw Fetch Error: ${error.message}`);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/api/restaurants');
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchDishes = async () => {
        try {
            const response = await api.get('/api/menu/dishes');
            setDishes(response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'restaurants') {
            fetchRestaurants();
            fetchDishes();
        }
    }, [activeTab]);

    if (!hasAdminOrManagerRole()) {
        return (
            <div>
                <h2>Access Denied</h2>
                <p>You need ADMIN or MANAGER role to access this page.</p>
                <p>Current user: {currentUser?.email || 'Not logged in'}</p>
                <p>User roles: {JSON.stringify(currentUser?.roles)}</p>
                <button onClick={() => console.log('Full user object:', currentUser)}>Debug User</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome, {currentUser?.email} (Roles: {JSON.stringify(currentUser?.roles)})</p>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('test')}>API Tests</button>
                <button onClick={() => setActiveTab('restaurants')}>Manage Content</button>
            </div>

            {error && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', backgroundColor: '#ffebee' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
            {success && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', backgroundColor: '#e8f5e9' }}>
                    <strong>Success:</strong> {success}
                </div>
            )}

            {activeTab === 'test' && (
                <div>
                    <h3>API Testing Panel</h3>

                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Test Data</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Name:</label><br />
                            <input
                                type="text"
                                value={testData.name}
                                onChange={(e) => setTestData({...testData, name: e.target.value})}
                                style={{ width: '300px', padding: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Cuisine:</label><br />
                            <input
                                type="text"
                                value={testData.cuisine}
                                onChange={(e) => setTestData({...testData, cuisine: e.target.value})}
                                style={{ width: '300px', padding: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Address:</label><br />
                            <input
                                type="text"
                                value={testData.address}
                                onChange={(e) => setTestData({...testData, address: e.target.value})}
                                style={{ width: '300px', padding: '5px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={testHeaders} style={{ marginRight: '10px' }}>Test Headers</button>
                        <button onClick={testAdminGET} style={{ marginRight: '10px' }}>Test GET</button>
                        <button onClick={testAdminPOST} style={{ marginRight: '10px' }}>Test POST</button>
                        <button onClick={testRawFetch}>Test Raw Fetch</button>
                    </div>

                    {testResult && (
                        <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', backgroundColor: '#f5f5f5', fontFamily: 'monospace', fontSize: '12px' }}>
                            <strong>Test Result:</strong><br />
                            {testResult}
                        </div>
                    )}

                    <div style={{ marginTop: '20px', borderTop: '1px solid black', paddingTop: '10px' }}>
                        <h4>Debug Information</h4>
                        <button onClick={() => {
                            console.log('Current user:', currentUser);
                            console.log('LocalStorage user:', localStorage.getItem('user'));
                            console.log('API defaults:', api.defaults);
                        }}>
                            Log Debug Info
                        </button>
                        <p style={{ fontSize: '12px', marginTop: '10px' }}>
                            Check browser Console (F12) for detailed debug information
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'restaurants' && (
                <div>
                    <h3>Restaurant Management</h3>

                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Create New Restaurant (Simple Form)</h4>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const response = await api.post('/api/admin/restaurants', testData);
                                setSuccess(`Restaurant created! ID: ${response.data.id}`);
                                setTestData({ name: '', cuisine: '', address: '' });
                                fetchRestaurants();
                            } catch (error) {
                                setError(`Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
                            }
                        }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Name:</label><br />
                                <input
                                    type="text"
                                    value={testData.name}
                                    onChange={(e) => setTestData({...testData, name: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Cuisine:</label><br />
                                <input
                                    type="text"
                                    value={testData.cuisine}
                                    onChange={(e) => setTestData({...testData, cuisine: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Address:</label><br />
                                <input
                                    type="text"
                                    value={testData.address}
                                    onChange={(e) => setTestData({...testData, address: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <button type="submit">Create Restaurant</button>
                        </form>
                    </div>

                    <div style={{ margin: '20px 0' }}>
                        <h4>Existing Restaurants ({restaurants.length})</h4>
                        {restaurants.length === 0 ? (
                            <p>No restaurants found</p>
                        ) : (
                            restaurants.map(restaurant => (
                                <div key={restaurant.id} style={{ border: '1px solid black', padding: '10px', margin: '5px 0' }}>
                                    <p><strong>{restaurant.name}</strong> ({restaurant.cuisine})</p>
                                    <p>Address: {restaurant.address}</p>
                                    <p>ID: {restaurant.id}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;