import React, { useState, useEffect } from 'react';
import RestaurantSelector from '../components/HomePage/RestaurantSelector';
import MenuList from '../components/HomePage/MenuList';
import ShoppingCart from '../components/HomePage/ShoppingCart';
import { restaurantApi, cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext'; // ИМПОРТИРУЕМ useAuth

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ПОЛУЧАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    const { user } = useAuth();

    useEffect(() => {
        loadRestaurants();
        loadCartFromServer();
    }, []);

    const loadRestaurants = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Loading restaurants...');
            const response = await restaurantApi.getAll({
                page: 0,
                size: 50,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            console.log('Restaurants response:', response.data);
            const restaurantsData = response.data.content || [];
            setRestaurants(restaurantsData);

            if (restaurantsData.length > 0) {
                setSelectedRestaurant(restaurantsData[0]);
            }
        } catch (error) {
            console.error('Error loading restaurants:', error);
            setError('Не удалось загрузить рестораны. Проверьте подключение к серверу.');
        } finally {
            setLoading(false);
        }
    };

    const loadCartFromServer = async () => {
        try {
            console.log('Loading cart from server...');
            const response = await cartApi.getCart();
            console.log('Cart from server:', response.data);

            if (response.data && Array.isArray(response.data)) {
                // Преобразуем данные из сервера в формат фронтенда
                const serverCart = response.data.map(item => ({
                    id: item.dishId,
                    name: item.dishName || `Блюдо ${item.dishId}`,
                    price: item.price / 100, // Конвертируем из копеек
                    quantity: item.quantity || 1,
                    description: item.dishDescription,
                    restaurantId: item.restaurantId
                }));
                setCart(serverCart);
            }
        } catch (error) {
            console.warn('Could not load cart from server, using local cart:', error.message);
            // Используем локальную корзину из localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Error parsing saved cart:', e);
                }
            }
        }
    };

    const saveCartToServer = async (cartItems) => {
        try {
            // Сохраняем в localStorage как fallback
            localStorage.setItem('cart', JSON.stringify(cartItems));

            // Отправляем на сервер
            for (const item of cartItems) {
                const cartItemDto = {
                    dishId: item.id,
                    dishName: item.name,
                    dishDescription: item.description,
                    price: Math.round(item.price * 100), // Конвертируем в копейки
                    quantity: item.quantity,
                    restaurantId: item.restaurantId || selectedRestaurant?.id
                };

                await cartApi.addToCart(cartItemDto);
            }
        } catch (error) {
            console.warn('Could not save cart to server:', error.message);
            // Используем только localStorage
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    };

    const handleRestaurantChange = (restaurant) => {
        setSelectedRestaurant(restaurant);
        // Очищаем корзину при смене ресторана
        if (cart.length > 0) {
            if (window.confirm('При смене ресторана корзина будет очищена. Продолжить?')) {
                setCart([]);
                localStorage.removeItem('cart');
            } else {
                return; // Отмена смены ресторана
            }
        }
    };

    const addToCart = async (dish) => {
        if (!selectedRestaurant) {
            alert('Пожалуйста, выберите ресторан');
            return;
        }

        const newCart = [...cart];
        const existingItem = newCart.find(item => item.id === dish.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            newCart.push({
                ...dish,
                quantity: 1,
                restaurantId: selectedRestaurant.id
            });
        }

        setCart(newCart);
        await saveCartToServer(newCart);
    };

    const removeFromCart = async (dishId) => {
        const newCart = cart.filter(item => item.id !== dishId);
        setCart(newCart);
        await saveCartToServer(newCart);
    };

    const updateQuantity = async (dishId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(dishId);
            return;
        }

        const newCart = cart.map(item =>
            item.id === dishId ? { ...item, quantity } : item
        );
        setCart(newCart);
        await saveCartToServer(newCart);
    };

    const clearCart = async () => {
        if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
            setCart([]);
            localStorage.removeItem('cart');

            try {
                await cartApi.clearCart();
            } catch (error) {
                console.warn('Could not clear cart on server:', error.message);
            }
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка ресторанов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={loadRestaurants} className="btn btn-retry">
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="grid-layout">
                    <div className="sidebar">
                        <RestaurantSelector
                            restaurants={restaurants}
                            selectedRestaurant={selectedRestaurant}
                            onSelect={handleRestaurantChange}
                        />

                        {/* ПЕРЕДАЕМ user В ShoppingCart */}
                        <ShoppingCart
                            cart={cart}
                            onRemove={removeFromCart}
                            onUpdateQuantity={updateQuantity}
                            onClear={clearCart}
                            totalPrice={getTotalPrice()}
                            restaurantId={selectedRestaurant?.id}
                            restaurantName={selectedRestaurant?.name}
                            user={user} // ПЕРЕДАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
                        />
                    </div>

                    <div className="main-content-area">
                        {selectedRestaurant && (
                            <div className="restaurant-header">
                                <h1 className="restaurant-name">{selectedRestaurant.name}</h1>
                                <p className="restaurant-info">
                                    <span className="cuisine">{selectedRestaurant.cuisine}</span>
                                    <span className="separator">•</span>
                                    <span className="address">{selectedRestaurant.address}</span>
                                </p>
                                <p className="restaurant-id">ID: {selectedRestaurant.id}</p>
                            </div>
                        )}

                        <MenuList
                            restaurantId={selectedRestaurant?.id}
                            onAddToCart={addToCart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;