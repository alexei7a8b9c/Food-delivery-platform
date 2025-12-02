import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DishCard from '../components/DishCard';
import { restaurantService } from '../services/restaurantService';
import '../styles/common.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const fetchRestaurantDetails = async () => {
        try {
            setLoading(true);

            // Получаем информацию о ресторане
            const restaurantData = await restaurantService.getRestaurantById(id);
            console.log('Restaurant data:', restaurantData); // Для отладки
            setRestaurant(restaurantData);

            // Получаем блюда ресторана
            const dishesData = await restaurantService.getRestaurantDishes(id);
            console.log('Dishes data:', dishesData); // Для отладки
            setDishes(dishesData);

            setError(null);
        } catch (err) {
            console.error('Failed to fetch restaurant details:', err);
            setError('Не удалось загрузить информацию о ресторане');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка информации о ресторане...</h2>
                </div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="container">
                <div className="error">
                    <h2>{error || 'Ресторан не найден'}</h2>
                    <button onClick={fetchRestaurantDetails} className="btn btn-primary">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="restaurant-header">
                <h1>{restaurant.name}</h1>
                <div className="restaurant-info">
                    <span className="cuisine-badge">{restaurant.cuisine}</span>
                    <p className="address">{restaurant.address}</p>
                </div>
            </div>

            <div className="dishes-section">
                <h2>Меню</h2>

                {dishes.length === 0 ? (
                    <div className="empty-state">
                        <p>В этом ресторане пока нет блюд</p>
                    </div>
                ) : (
                    <div className="dish-grid">
                        {dishes.map((dish) => (
                            <DishCard
                                key={dish.id}
                                dish={dish}
                                restaurantId={restaurant.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;