import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantService } from '../services/restaurantService';
import '../styles/common.css';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const data = await restaurantService.getAllRestaurants();
            console.log('Restaurants data:', data); // Для отладки
            setRestaurants(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
            setError('Не удалось загрузить рестораны');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка ресторанов...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    <h2>{error}</h2>
                    <button onClick={fetchRestaurants} className="btn btn-primary">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>Рестораны</h1>
                <p>Выберите ресторан для просмотра меню</p>
            </div>

            {restaurants.length === 0 ? (
                <div className="empty-state">
                    <h2>Нет доступных ресторанов</h2>
                    <p>Попробуйте обновить страницу позже</p>
                </div>
            ) : (
                <div className="restaurant-grid">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Restaurants;