import React, { useState, useEffect } from 'react';
import RestaurantSelector from '../components/HomePage/RestaurantSelector';
import MenuList from '../components/HomePage/MenuList';
import ShoppingCart from '../components/HomePage/ShoppingCart';
import { restaurantApi } from '../services/api';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRestaurants();
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

    const handleRestaurantChange = (restaurant) => {
        setSelectedRestaurant(restaurant);
    };

    const addToCart = (dish) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === dish.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...dish, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (dishId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== dishId));
    };

    const updateQuantity = (dishId, quantity) => {
        if (quantity < 1) {
            removeFromCart(dishId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === dishId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
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

                        <ShoppingCart
                            cart={cart}
                            onRemove={removeFromCart}
                            onUpdateQuantity={updateQuantity}
                            onClear={clearCart}
                            totalPrice={getTotalPrice()}
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