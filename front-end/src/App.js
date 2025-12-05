import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaUser, FaHome, FaUtensils, FaSignInAlt, FaSignOutAlt, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

// API Gateway
const API_BASE = 'http://localhost:8080';

// Настроим axios для добавления токена
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Компонент навигации
function Navbar({ user, onLogout }) {
    return (
        <nav className="navbar">
            <div className="logo" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff7e5f' }}>
                🍔 FoodDelivery
            </div>
            <div className="nav-links">
                <Link to="/" className="nav-link"><FaHome /> Главная</Link>
                <Link to="/restaurants" className="nav-link"><FaUtensils /> Рестораны</Link>
                {user && <Link to="/cart" className="nav-link"><FaShoppingCart /> Корзина</Link>}
                {user && <Link to="/orders" className="nav-link">📋 Заказы</Link>}
                {user ? (
                    <>
            <span className="nav-link" style={{ background: '#36d1dc', color: 'white' }}>
              <FaUser /> {user.email}
            </span>
                        <button onClick={onLogout} className="button danger-bg">
                            <FaSignOutAlt /> Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="button primary-bg"><FaSignInAlt /> Войти</Link>
                        <Link to="/register" className="button secondary-bg">Регистрация</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

// Главная страница
function Home() {
    return (
        <div className="container">
            <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                <h1 style={{ fontSize: '48px', color: '#ff7e5f', marginBottom: '20px' }}>🍽️ Добро пожаловать в FoodDelivery!</h1>
                <p style={{ fontSize: '20px', color: '#666', marginBottom: '30px' }}>
                    Заказывайте вкусную еду из лучших ресторанов города с доставкой на дом
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <Link to="/restaurants" className="button primary-bg" style={{ fontSize: '18px', padding: '15px 30px' }}>
                        Смотреть рестораны
                    </Link>
                    <Link to="/register" className="button secondary-bg" style={{ fontSize: '18px', padding: '15px 30px' }}>
                        Начать заказывать
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Страница регистрации
function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', fullName: '', telephone: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE}/api/auth/register`, form);
            console.log('Registration response:', response.data);

            if (response.data.success || response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken || response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    email: form.email,
                    fullName: form.fullName,
                    userId: response.data.userId
                }));

                setMessage({ type: 'success', text: 'Регистрация успешна! Перенаправление...' });
                setTimeout(() => navigate('/restaurants'), 1500);
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Ошибка регистрации' });
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data || error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.response?.data?.error || 'Ошибка регистрации'
            });
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#36d1dc' }}>Регистрация</h2>
                {message && <div className={`message ${message.type}`}>{message.text}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    <input type="password" placeholder="Пароль (минимум 6 символов)" value={form.password}
                           onChange={e => setForm({...form, password: e.target.value})} required minLength="6" />
                    <input type="text" placeholder="Полное имя" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
                    <input type="text" placeholder="Телефон (необязательно)" value={form.telephone}
                           onChange={e => setForm({...form, telephone: e.target.value})} />
                    <button type="submit" className="button secondary-bg" style={{ width: '100%' }}>Зарегистрироваться</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Уже есть аккаунт? <Link to="/login" style={{ color: '#ff7e5f' }}>Войти</Link>
                </p>
            </div>
        </div>
    );
}

// Страница входа
function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE}/api/auth/login`, form);
            console.log('Login response:', response.data);

            if (response.data.success || response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken || response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    email: form.email,
                    fullName: response.data.fullName,
                    userId: response.data.userId
                }));

                setMessage({ type: 'success', text: 'Вход успешен! Перенаправление...' });
                setTimeout(() => navigate('/restaurants'), 1000);
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Ошибка входа' });
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.response?.data?.error || 'Ошибка входа'
            });
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ff7e5f' }}>Вход в систему</h2>
                {message && <div className={`message ${message.type}`}>{message.text}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    <input type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                    <button type="submit" className="button primary-bg" style={{ width: '100%' }}>Войти</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Нет аккаунта? <Link to="/register" style={{ color: '#36d1dc' }}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}

// Страница всех ресторанов
function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/restaurants`);
            console.log('Restaurants response:', response.data);
            setRestaurants(response.data);
        } catch (error) {
            console.error('Ошибка загрузки ресторанов:', error);
            setError('Не удалось загрузить рестораны');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '40px', color: '#36d1dc' }}>⏳</div>
                    <h2>Загрузка ресторанов...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '40px', color: '#ff416c' }}>❌</div>
                    <h2>{error}</h2>
                    <button onClick={loadRestaurants} className="button primary-bg" style={{ marginTop: '20px' }}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ color: '#5b86e5', marginBottom: '30px' }}>🍕 Наши рестораны ({restaurants.length})</h1>

            {restaurants.length === 0 ? (
                <div className="card">
                    <p style={{ fontSize: '18px', color: '#666' }}>Рестораны не найдены</p>
                </div>
            ) : (
                restaurants.map(restaurant => (
                    <div key={restaurant.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ color: '#ff7e5f', marginBottom: '10px' }}>{restaurant.name}</h2>
                                <p style={{ marginBottom: '5px' }}>🍽️ <strong>Кухня:</strong> {restaurant.cuisine}</p>
                                <p>📍 <strong>Адрес:</strong> {restaurant.address}</p>
                            </div>
                            <Link
                                to={`/restaurants/${restaurant.id}/dishes`}
                                className="button primary-bg"
                                style={{ textDecoration: 'none' }}
                            >
                                Смотреть меню
                            </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// Страница блюд конкретного ресторана
function RestaurantDishes() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        loadRestaurantAndDishes();
        loadCart();
    }, [restaurantId]);

    const loadRestaurantAndDishes = async () => {
        try {
            setLoading(true);

            // Загружаем информацию о ресторане
            const restaurantResponse = await axios.get(`${API_BASE}/api/restaurants/${restaurantId}`);
            setRestaurant(restaurantResponse.data);

            // Загружаем блюда ресторана
            const dishesResponse = await axios.get(`${API_BASE}/api/restaurants/${restaurantId}/dishes`);
            setDishes(dishesResponse.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            alert('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const loadCart = async () => {
        if (!user) return;

        try {
            const response = await axios.get(`${API_BASE}/api/cart`);
            setCart(response.data);
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    };

    const addToCart = async (dish) => {
        if (!user) {
            alert('Пожалуйста, войдите в систему');
            return;
        }

        try {
            // Проверяем, есть ли уже это блюдо в корзине
            const existingItem = cart.find(item => item.dishId === dish.id);

            if (existingItem) {
                // Увеличиваем количество
                await axios.put(`${API_BASE}/api/cart/update/${dish.id}?quantity=${existingItem.quantity + 1}`);
            } else {
                // Добавляем новое блюдо
                const cartItem = {
                    dishId: dish.id,
                    quantity: 1,
                    restaurantId: dish.restaurantId,
                    dishName: dish.name,
                    dishDescription: dish.description,
                    price: dish.price
                };

                await axios.post(`${API_BASE}/api/cart/add`, cartItem);
            }

            // Обновляем корзину
            await loadCart();
            alert(`Добавлено: ${dish.name}`);
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Не удалось добавить в корзину');
        }
    };

    const getQuantityInCart = (dishId) => {
        const item = cart.find(item => item.dishId === dishId);
        return item ? item.quantity : 0;
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '40px', color: '#36d1dc' }}>⏳</div>
                    <h2>Загрузка меню...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ marginBottom: '20px' }}>
                <Link to="/restaurants" style={{ color: '#36d1dc', textDecoration: 'none' }}>
                    ← Назад к ресторанам
                </Link>
            </div>

            {restaurant && (
                <div className="card" style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: '#ff7e5f' }}>{restaurant.name}</h1>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
                        🍽️ {restaurant.cuisine} кухня
                    </p>
                    <p>📍 {restaurant.address}</p>
                </div>
            )}

            <h2 style={{ color: '#5b86e5', marginBottom: '20px' }}>🍴 Меню ({dishes.length} блюд)</h2>

            {dishes.length === 0 ? (
                <div className="card">
                    <p style={{ fontSize: '18px', color: '#666' }}>Меню пусто</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {dishes.map(dish => (
                        <div key={dish.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: '#5b86e5', marginBottom: '10px' }}>{dish.name}</h3>
                                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{dish.description}</p>

                                    {dish.imageUrl && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <img
                                                src={dish.imageUrl}
                                                alt={dish.name}
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff7e5f', marginBottom: '10px' }}>
                                        {dish.price} руб.
                                    </div>

                                    {getQuantityInCart(dish.id) > 0 && (
                                        <div style={{
                                            background: '#a8e063',
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '15px',
                                            fontSize: '14px',
                                            marginBottom: '10px'
                                        }}>
                                            В корзине: {getQuantityInCart(dish.id)}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => addToCart(dish)}
                                        className="button success-bg"
                                        style={{ width: '100%' }}
                                    >
                                        Добавить в корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Корзина
function Cart() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderPlacing, setOrderPlacing] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user) {
            loadCart();
        }
    }, [user]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/cart`);
            console.log('Cart response:', response.data);
            setCart(response.data);
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            alert('Не удалось загрузить корзину');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (dishId) => {
        try {
            await axios.delete(`${API_BASE}/api/cart/remove/${dishId}`);
            setCart(cart.filter(item => item.dishId !== dishId));
        } catch (error) {
            console.error('Ошибка удаления из корзины:', error);
            alert('Не удалось удалить из корзины');
        }
    };

    const updateQuantity = async (dishId, quantity) => {
        if (quantity < 1) {
            removeFromCart(dishId);
            return;
        }

        try {
            await axios.put(`${API_BASE}/api/cart/update/${dishId}?quantity=${quantity}`);
            setCart(cart.map(item =>
                item.dishId === dishId ? { ...item, quantity } : item
            ));
        } catch (error) {
            console.error('Ошибка обновления количества:', error);
            alert('Не удалось обновить количество');
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Очистить всю корзину?')) return;

        try {
            await axios.delete(`${API_BASE}/api/cart/clear`);
            setCart([]);
            alert('Корзина очищена');
        } catch (error) {
            console.error('Ошибка очистки корзины:', error);
            alert('Не удалось очистить корзину');
        }
    };

    const placeOrder = async () => {
        if (cart.length === 0) {
            alert('Корзина пуста');
            return;
        }

        if (!window.confirm(`Оформить заказ на сумму ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} руб.?`)) {
            return;
        }

        try {
            setOrderPlacing(true);

            // Группируем блюда по ресторанам
            const restaurantId = cart[0].restaurantId;

            const orderData = {
                restaurantId: restaurantId,
                items: cart.map(item => ({
                    dishId: item.dishId,
                    quantity: item.quantity,
                    price: item.price,
                    dishName: item.dishName,
                    dishDescription: item.dishDescription
                })),
                paymentMethod: "CASH_ON_DELIVERY"
            };

            console.log('Placing order:', orderData);
            const response = await axios.post(`${API_BASE}/api/orders/place`, orderData);
            console.log('Order response:', response.data);

            alert('✅ Заказ успешно создан! Номер заказа: ' + response.data.id);
            await clearCart();
        } catch (error) {
            console.error('Ошибка создания заказа:', error);
            alert('❌ Ошибка создания заказа: ' + (error.response?.data?.message || 'Неизвестная ошибка'));
        } finally {
            setOrderPlacing(false);
        }
    };

    if (!user) {
        return (
            <div className="container">
                <div className="card">
                    <h2 style={{ color: '#ff416c' }}>🚫 Требуется вход</h2>
                    <p>Пожалуйста, войдите в систему для доступа к корзине</p>
                    <Link to="/login" className="button primary-bg">Войти</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '40px', color: '#36d1dc' }}>⏳</div>
                    <h2>Загрузка корзины...</h2>
                </div>
            </div>
        );
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="container">
            <h1 style={{ color: '#a8e063', marginBottom: '30px' }}>
                🛒 Корзина ({totalItems} {totalItems === 1 ? 'товар' : 'товаров'})
            </h1>

            {cart.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛍️</div>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Корзина пуста</p>
                    <Link to="/restaurants" className="button primary-bg">Перейти к ресторанам</Link>
                </div>
            ) : (
                <>
                    {cart.map((item) => (
                        <div key={item.dishId} className="card" style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: '#5b86e5', marginBottom: '5px' }}>{item.dishName}</h3>
                                    <p style={{ fontSize: '14px', color: '#666' }}>{item.dishDescription}</p>
                                    <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
                                        Ресторан ID: {item.restaurantId}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button
                                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                                            className="button danger-bg"
                                            style={{ padding: '8px 15px', fontSize: '16px' }}
                                        >
                                            <FaMinus />
                                        </button>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                                        <button
                                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                                            className="button success-bg"
                                            style={{ padding: '8px 15px', fontSize: '16px' }}
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff7e5f' }}>
                                            {item.price * item.quantity} руб.
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            {item.price} руб. × {item.quantity}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.dishId)}
                                        className="button danger-bg"
                                        style={{ padding: '8px 15px' }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="card" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h2 style={{ color: '#5b86e5' }}>Итого к оплате:</h2>
                                <p style={{ color: '#666' }}>{cart.length} позиций, {totalItems} товаров</p>
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff7e5f' }}>
                                {totalPrice} руб.
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                            <button
                                onClick={clearCart}
                                className="button danger-bg"
                                style={{ padding: '15px 30px', flex: 1 }}
                            >
                                Очистить корзину
                            </button>
                            <button
                                onClick={placeOrder}
                                className="button success-bg"
                                style={{ padding: '15px 30px', flex: 2, fontSize: '18px' }}
                                disabled={orderPlacing}
                            >
                                {orderPlacing ? 'Оформляем заказ...' : '📦 Оформить заказ'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Заказы пользователя
function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/orders`);
            console.log('Orders response:', response.data);
            setOrders(response.data);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            alert('Не удалось загрузить заказы');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container">
                <div className="card">
                    <h2 style={{ color: '#ff416c' }}>🚫 Требуется вход</h2>
                    <p>Пожалуйста, войдите в систему для просмотра заказов</p>
                    <Link to="/login" className="button primary-bg">Войти</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '40px', color: '#36d1dc' }}>⏳</div>
                    <h2>Загрузка заказов...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ color: '#5b86e5', marginBottom: '30px' }}>📋 История заказов ({orders.length})</h1>

            {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>У вас пока нет заказов</p>
                    <Link to="/restaurants" className="button primary-bg">Сделать первый заказ</Link>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="card" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <h3 style={{ color: '#ff7e5f' }}>Заказ #{order.id}</h3>
                                    <span style={{
                                        padding: '5px 15px',
                                        borderRadius: '20px',
                                        background: order.status === 'DELIVERED' ? '#a8e063' :
                                            order.status === 'CANCELLED' ? '#ff416c' :
                                                order.status === 'PENDING' ? '#ffb347' : '#36d1dc',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}>
                    {order.status}
                  </span>
                                </div>

                                <p style={{ marginBottom: '5px' }}>📅 <strong>Дата:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                                <p style={{ marginBottom: '5px' }}>🏪 <strong>Ресторан ID:</strong> {order.restaurantId}</p>

                                {order.items && order.items.length > 0 && (
                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                        <h4 style={{ color: '#5b86e5', marginBottom: '10px' }}>🍴 Состав заказа:</h4>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                margin: '8px 0',
                                                padding: '10px',
                                                background: '#f8f9fa',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold' }}>{item.dishName}</div>
                                                    <div style={{ fontSize: '14px', color: '#666' }}>{item.dishDescription}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                                    <div>{item.quantity} × {item.price} руб.</div>
                                                    <div style={{ fontWeight: 'bold', color: '#ff7e5f' }}>{item.price * item.quantity} руб.</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ textAlign: 'right', marginLeft: '30px', minWidth: '200px' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff7e5f', marginBottom: '10px' }}>
                                    {order.totalPrice} руб.
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>Общая сумма</div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// Основной компонент App
function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <Router>
            <div>
                <Navbar user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="/restaurants/:restaurantId/dishes" element={<RestaurantDishes />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                </Routes>

                {/* Футер */}
                <footer style={{
                    background: 'linear-gradient(90deg, #2c3e50, #4a6491)',
                    color: 'white',
                    textAlign: 'center',
                    padding: '30px',
                    marginTop: '50px',
                    borderRadius: '20px 20px 0 0'
                }}>
                    <h3 style={{ marginBottom: '15px' }}>🍔 FoodDelivery Platform</h3>
                    <p>© 2024 Все права защищены. Заказывайте с удовольствием!</p>
                    <div style={{ fontSize: '24px', marginTop: '15px' }}>
                        🍕 🍣 🍔 🥗 🍜 🍰
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;