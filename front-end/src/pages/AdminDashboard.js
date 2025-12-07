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
    const [loading, setLoading] = useState(false);

    // Данные для тестирования
    const [testData, setTestData] = useState({
        name: 'Test Restaurant ' + Date.now(),
        cuisine: 'Test Cuisine',
        address: 'Test Address ' + Date.now()
    });

    const [testDishData, setTestDishData] = useState({
        name: 'Test Dish ' + Date.now(),
        description: 'Test Description',
        price: '1500',
        imageUrl: '/images/dishes/test.jpg',
        restaurantId: '1'
    });

    // Загрузка данных
    const fetchRestaurants = async () => {
        try {
            console.log('Fetching restaurants...');
            const response = await api.get('/api/restaurants');
            console.log('Restaurants loaded:', response.data.length);
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchDishes = async () => {
        try {
            console.log('Fetching dishes...');
            const response = await api.get('/api/menu/dishes');
            console.log('Dishes loaded:', response.data.length);
            setDishes(response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchRestaurants();
            fetchDishes();
        }
    }, [currentUser]);

    // Тест 1: Проверка заголовков
    const testHeaders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('=== HEADERS TEST ===');
            console.log('User from localStorage:', user);
            console.log('User ID:', user ? user.userId : 'null');
            console.log('Roles:', user ? user.roles : 'null');
            console.log('Token exists:', user ? !!user.accessToken : false);
            if (user && user.accessToken) {
                console.log('Token (first 50):', user.accessToken.substring(0, 50) + '...');
            }

            // Проверяем публичный endpoint
            const response = await api.get('/api/restaurants');
            console.log('Public request successful, count:', response.data.length);

            setSuccess('Check browser console (F12) for headers info');
        } catch (error) {
            console.error('Headers test error:', error);
            setError('Headers test failed: ' + error.message);
        }
    };

    // Тест 2: GET запрос к админ endpoint
    const testAdminGET = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Testing GET /api/admin/restaurants...');

            const response = await api.get('/api/admin/restaurants');
            console.log('Admin GET success:', response.data);
            setSuccess(`GET Success! Status: ${response.status}, Found: ${response.data.length} restaurants`);
        } catch (error) {
            console.error('Admin GET error:', error);
            setError(`GET Error ${error.response ? error.response.status : 'unknown'}: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Тест 3: POST запрос для создания ресторана
    const testAdminPOST = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Testing POST /api/admin/restaurants...');
            console.log('Test data:', testData);

            const response = await api.post('/api/admin/restaurants', testData);
            console.log('Admin POST success:', response.data);
            setSuccess(`POST Success! Created restaurant with ID: ${response.data.id}`);

            // Обновляем данные
            fetchRestaurants();

            // Обновляем тестовые данные
            setTestData({
                name: 'Test Restaurant ' + Date.now(),
                cuisine: 'Test Cuisine',
                address: 'Test Address ' + Date.now()
            });
        } catch (error) {
            console.error('Admin POST error:', error);
            setError(`POST Error ${error.response ? error.response.status : 'unknown'}: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Тест 4: POST запрос для создания блюда
    const testAdminPOSTDish = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Testing POST /api/admin/restaurants/{id}/dishes...');

            // Используем первый доступный ресторан
            const restaurantId = restaurants.length > 0 ? restaurants[0].id : 1;
            const dishData = {
                ...testDishData,
                restaurantId: restaurantId
            };

            console.log('Dish data:', dishData);

            const response = await api.post(`/api/admin/restaurants/${restaurantId}/dishes`, dishData);
            console.log('Dish POST success:', response.data);
            setSuccess(`Dish Created! ID: ${response.data.id} in restaurant ${restaurantId}`);

            fetchDishes();

            // Обновляем тестовые данные
            setTestDishData({
                name: 'Test Dish ' + Date.now(),
                description: 'Test Description',
                price: '1500',
                imageUrl: '/images/dishes/test.jpg',
                restaurantId: restaurantId.toString()
            });
        } catch (error) {
            console.error('Dish POST error:', error);
            setError(`Dish Error: ${error.response ? error.response.status : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Тест 5: DELETE запрос
    const testAdminDELETE = async () => {
        try {
            if (restaurants.length === 0) {
                setError('No restaurants to delete');
                return;
            }

            // Берем последний созданный ресторан для удаления
            const lastRestaurant = restaurants[restaurants.length - 1];
            if (!window.confirm(`Delete restaurant "${lastRestaurant.name}" (ID: ${lastRestaurant.id})?`)) {
                return;
            }

            setLoading(true);
            setError('');
            console.log('Testing DELETE /api/admin/restaurants/{id}...');

            await api.delete(`/api/admin/restaurants/${lastRestaurant.id}`);
            console.log('Delete success');
            setSuccess(`Restaurant "${lastRestaurant.name}" deleted successfully`);

            fetchRestaurants();
        } catch (error) {
            console.error('Delete error:', error);
            setError(`Delete Error: ${error.response ? error.response.status : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div>
                <h2>Admin Dashboard</h2>
                <p>Please login to access admin panel</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>User: {currentUser ? currentUser.email : 'Not logged in'} (ID: {currentUser ? currentUser.userId : 'N/A'})</p>
            <p>Roles: {currentUser ? JSON.stringify(currentUser.roles) : 'None'}</p>

            <div style={{ marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('test')}
                    style={{
                        marginRight: '10px',
                        border: '1px solid black',
                        background: activeTab === 'test' ? 'black' : 'white',
                        color: activeTab === 'test' ? 'white' : 'black'
                    }}
                >
                    API Tests
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    style={{
                        border: '1px solid black',
                        background: activeTab === 'data' ? 'black' : 'white',
                        color: activeTab === 'data' ? 'white' : 'black'
                    }}
                >
                    View Data ({restaurants.length} restaurants, {dishes.length} dishes)
                </button>
            </div>

            {error && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', background: '#f0f0f0' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', background: '#f0f0f0' }}>
                    <strong>Success:</strong> {success}
                </div>
            )}

            {activeTab === 'test' && (
                <div>
                    <h3>API Testing Panel</h3>

                    <div style={{ marginBottom: '30px' }}>
                        <h4>Test Controls</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <button
                                onClick={testHeaders}
                                style={{ border: '1px solid black', padding: '8px 16px' }}
                            >
                                Test Headers & Auth
                            </button>
                            <button
                                onClick={testAdminGET}
                                disabled={loading}
                                style={{ border: '1px solid black', padding: '8px 16px' }}
                            >
                                {loading ? 'Testing...' : 'Test Admin GET'}
                            </button>
                            <button
                                onClick={testAdminPOST}
                                disabled={loading}
                                style={{ border: '1px solid black', padding: '8px 16px' }}
                            >
                                {loading ? 'Testing...' : 'Test Admin POST'}
                            </button>
                            <button
                                onClick={testAdminPOSTDish}
                                disabled={loading || restaurants.length === 0}
                                style={{ border: '1px solid black', padding: '8px 16px' }}
                            >
                                {loading ? 'Testing...' : 'Test Dish POST'}
                            </button>
                            <button
                                onClick={testAdminDELETE}
                                disabled={loading || restaurants.length === 0}
                                style={{ border: '1px solid black', padding: '8px 16px' }}
                            >
                                {loading ? 'Testing...' : 'Test DELETE'}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                console.log('=== DEBUG INFO ===');
                                console.log('Current user:', currentUser);
                                console.log('LocalStorage:', localStorage.getItem('user'));
                                console.log('Restaurants:', restaurants);
                                console.log('Dishes:', dishes);
                                console.log('API defaults:', api.defaults);
                            }}
                            style={{ border: '1px solid black', padding: '8px 16px' }}
                        >
                            Log Debug Info to Console
                        </button>
                    </div>

                    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
                        <h4>Test Restaurant Data</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Name:</label><br />
                            <input
                                type="text"
                                value={testData.name}
                                onChange={(e) => setTestData({...testData, name: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Cuisine:</label><br />
                            <input
                                type="text"
                                value={testData.cuisine}
                                onChange={(e) => setTestData({...testData, cuisine: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Address:</label><br />
                            <input
                                type="text"
                                value={testData.address}
                                onChange={(e) => setTestData({...testData, address: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                    </div>

                    <div style={{ border: '1px solid black', padding: '20px' }}>
                        <h4>Test Dish Data</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Restaurant ID:</label><br />
                            <input
                                type="number"
                                value={testDishData.restaurantId}
                                onChange={(e) => setTestDishData({...testDishData, restaurantId: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Dish Name:</label><br />
                            <input
                                type="text"
                                value={testDishData.name}
                                onChange={(e) => setTestDishData({...testDishData, name: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Price (cents):</label><br />
                            <input
                                type="number"
                                value={testDishData.price}
                                onChange={(e) => setTestDishData({...testDishData, price: e.target.value})}
                                style={{ width: '100%', maxWidth: '400px', padding: '5px', border: '1px solid black' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'data' && (
                <div>
                    <h3>Data View</h3>

                    <div style={{ marginBottom: '30px' }}>
                        <h4>Restaurants ({restaurants.length})</h4>
                        {restaurants.length === 0 ? (
                            <p>No restaurants found</p>
                        ) : (
                            <div>
                                {restaurants.map((restaurant) => (
                                    <div key={restaurant.id} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                                        <h5>{restaurant.name} (ID: {restaurant.id})</h5>
                                        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                                        <p><strong>Address:</strong> {restaurant.address}</p>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Delete ${restaurant.name}?`)) {
                                                    api.delete(`/api/admin/restaurants/${restaurant.id}`)
                                                        .then(() => fetchRestaurants())
                                                        .catch(err => console.error('Delete error:', err));
                                                }
                                            }}
                                            style={{ border: '1px solid black', padding: '5px 10px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4>Dishes ({dishes.length})</h4>
                        {dishes.length === 0 ? (
                            <p>No dishes found</p>
                        ) : (
                            <div>
                                {dishes.slice(0, 10).map((dish) => (
                                    <div key={dish.id} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                                        <h5>{dish.name} (ID: {dish.id})</h5>
                                        <p><strong>Restaurant ID:</strong> {dish.restaurantId}</p>
                                        <p><strong>Price:</strong> ${(dish.price / 100).toFixed(2)}</p>
                                        <p><strong>Description:</strong> {dish.description || 'N/A'}</p>
                                    </div>
                                ))}
                                {dishes.length > 10 && <p>...and {dishes.length - 10} more dishes</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', borderTop: '1px solid black', paddingTop: '10px' }}>
                <button
                    onClick={() => {
                        fetchRestaurants();
                        fetchDishes();
                    }}
                    style={{ border: '1px solid black', padding: '8px 16px' }}
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;