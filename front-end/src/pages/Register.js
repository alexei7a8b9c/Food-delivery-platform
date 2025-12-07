import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        telephone: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testRestaurants, setTestRestaurants] = useState([]);
    const [testDishes, setTestDishes] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    // Загружаем данные из базы через API при монтировании
    useEffect(() => {
        fetchDataFromAPI();
    }, []);

    const fetchDataFromAPI = async () => {
        setLoadingData(true);
        try {
            // Получаем рестораны из restaurant-service
            console.log('Fetching restaurants from API...');
            const restaurantsResponse = await api.get('/api/restaurants');
            console.log('Restaurants response:', restaurantsResponse.data);
            setTestRestaurants(restaurantsResponse.data || []);

            // Получаем блюда из restaurant-service
            console.log('Fetching dishes from API...');
            const dishesResponse = await api.get('/api/menu/dishes');
            console.log('Dishes response:', dishesResponse.data);
            setTestDishes(dishesResponse.data || []);

        } catch (error) {
            console.error('Error fetching data from API:', error);
            // Если API не доступно, показываем сообщение
            setError('Cannot fetch test data from server. Please check if backend services are running.');
        } finally {
            setLoadingData(false);
        }
    };

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
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Invalid email format');
            return;
        }

        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Заполняем фору случайными данными из реальной базы
    const fillWithRandomData = () => {
        if (testRestaurants.length === 0 || testDishes.length === 0) {
            setError('Please wait for test data to load from database');
            return;
        }

        // Берем случайный ресторан
        const randomRestaurant = testRestaurants[Math.floor(Math.random() * testRestaurants.length)];
        // Берем случайное блюдо из этого ресторана
        const restaurantDishes = testDishes.filter(dish => dish.restaurantId === randomRestaurant.id);
        const randomDish = restaurantDishes.length > 0
            ? restaurantDishes[Math.floor(Math.random() * restaurantDishes.length)]
            : testDishes[Math.floor(Math.random() * testDishes.length)];

        // Генерируем случайные данные на основе реальных из базы
        const randomId = Math.floor(Math.random() * 10000);
        const domains = ['example.com', 'gmail.com', 'yahoo.com', 'hotmail.com'];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];

        // Имя на основе ресторана или блюда
        const nameParts = randomRestaurant.name.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        setFormData({
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomId}@${randomDomain}`,
            password: 'test123',
            fullName: `${firstName} ${lastName}`,
            telephone: `+1-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
        });
        setConfirmPassword('test123');
    };

    // Заполняем тестовыми данными из базы (реальные рестораны)
    const fillWithRealRestaurantData = (restaurantIndex = 0) => {
        if (testRestaurants.length === 0) {
            setError('No restaurants loaded from database');
            return;
        }

        const restaurant = testRestaurants[restaurantIndex % testRestaurants.length];
        const nameParts = restaurant.name.split(' ');
        const firstName = nameParts[0] || 'Restaurant';

        setFormData({
            email: `${firstName.toLowerCase()}@restaurant.com`,
            password: 'password123',
            fullName: `${firstName} Owner`,
            telephone: '+1-555-0100'
        });
        setConfirmPassword('password123');
    };

    if (success) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Registration Successful!</h2>
                <p>Your account has been created successfully.</p>
                <p>Redirecting to home page...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Register</h2>

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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password (min 6 chars):</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Telephone (optional):</label>
                    <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || loadingData}
                    style={{ width: '100%', padding: '10px' }}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div style={{ marginTop: '20px' }}>
                <p>Already have an account? <Link to="/login">Login here</Link></p>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
                    <h3>Test Data from Database</h3>

                    {loadingData ? (
                        <p>Loading data from database...</p>
                    ) : (
                        <>
                            <p>
                                <strong>Loaded from API:</strong> {testRestaurants.length} restaurants, {testDishes.length} dishes
                            </p>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={fillWithRandomData}
                                    disabled={testRestaurants.length === 0}
                                    style={{ padding: '8px' }}
                                >
                                    Fill with Random Data
                                </button>

                                {testRestaurants.map((restaurant, index) => (
                                    <button
                                        key={restaurant.id}
                                        type="button"
                                        onClick={() => fillWithRealRestaurantData(index)}
                                        style={{ padding: '8px', fontSize: '12px' }}
                                        title={`Restaurant: ${restaurant.name}\nCuisine: ${restaurant.cuisine}`}
                                    >
                                        {restaurant.name.split(' ')[0]} Owner
                                    </button>
                                ))}
                            </div>

                            {/* Показываем данные из базы */}
                            {testRestaurants.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4>Available Restaurants (from database):</h4>
                                    <ul style={{ fontSize: '14px', marginLeft: '20px' }}>
                                        {testRestaurants.slice(0, 5).map(restaurant => (
                                            <li key={restaurant.id}>
                                                <strong>{restaurant.name}</strong> - {restaurant.cuisine} cuisine
                                            </li>
                                        ))}
                                    </ul>
                                    {testRestaurants.length > 5 && (
                                        <p>...and {testRestaurants.length - 5} more</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
                    <p style={{ fontSize: '12px', margin: 0 }}>
                        <strong>Note:</strong> This form sends data to the backend API.
                        Test buttons use real data loaded from the database via GET requests to:
                        <br />
                        • <code>GET /api/restaurants</code> - {testRestaurants.length} restaurants loaded
                        <br />
                        • <code>GET /api/menu/dishes</code> - {testDishes.length} dishes loaded
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;