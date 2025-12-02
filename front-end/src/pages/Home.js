import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { restaurantService } from '../services/restaurantService';
import '../styles/common.css';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Получаем топ ресторанов (первые 4)
            const restaurantsData = await restaurantService.getAllRestaurants();
            setRestaurants(restaurantsData.slice(0, 4));

            // Получаем популярные блюда (первые 8)
            const dishesData = await restaurantService.getAllDishes();
            setDishes(dishesData.slice(0, 8));
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Герой-секция */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Доставка еды</h1>
                    <p>Заказывайте любимые блюда из лучших ресторанов города</p>
                    <div className="hero-buttons">
                        <Link to="/restaurants" className="btn btn-primary">
                            Смотреть рестораны
                        </Link>
                        <Link to="/menu" className="btn btn-secondary">
                            Все блюда
                        </Link>
                    </div>
                </div>
            </div>

            {/* Секция ресторанов */}
            <section className="section">
                <div className="section-header">
                    <h2>Популярные рестораны</h2>
                    <Link to="/restaurants" className="view-all">
                        Все рестораны →
                    </Link>
                </div>

                {restaurants.length === 0 ? (
                    <div className="empty-state">
                        <p>Нет доступных ресторанов</p>
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
            </section>

            {/* Секция блюд */}
            <section className="section">
                <div className="section-header">
                    <h2>Популярные блюда</h2>
                    <Link to="/menu" className="view-all">
                        Все блюда →
                    </Link>
                </div>

                {dishes.length === 0 ? (
                    <div className="empty-state">
                        <p>Нет доступных блюд</p>
                    </div>
                ) : (
                    <div className="dish-grid">
                        {dishes.map((dish) => (
                            <DishCard
                                key={dish.id}
                                dish={dish}
                                restaurantId={dish.restaurantId}
                                showRestaurantInfo={true}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA секция */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Начните заказывать сейчас</h2>
                    <p>Более 100+ ресторанов и 1000+ блюд на выбор</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-large">
                            Зарегистрироваться
                        </Link>
                        <Link to="/restaurants" className="btn btn-outline btn-large">
                            Смотреть меню
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; // Это обязательная строка!