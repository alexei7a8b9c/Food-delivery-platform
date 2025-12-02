import React, { useState, useEffect, useCallback } from 'react'; // Добавляем useCallback
import DishCard from '../components/DishCard';
import { restaurantService } from '../services/restaurantService';
import '../styles/common.css';

const Menu = () => {
    const [dishes, setDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Используем useCallback для стабильной ссылки на функцию
    const filterDishes = useCallback(() => {
        let filtered = [...dishes];

        // Фильтр по ресторану
        if (selectedRestaurant !== 'all') {
            filtered = filtered.filter(dish =>
                dish.restaurantId === parseInt(selectedRestaurant)
            );
        }

        // Фильтр по поиску
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(dish =>
                dish.name.toLowerCase().includes(query) ||
                dish.description.toLowerCase().includes(query)
            );
        }

        setFilteredDishes(filtered);
    }, [dishes, selectedRestaurant, searchQuery]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterDishes();
    }, [filterDishes]); // Теперь зависимость стабильна

    const fetchData = async () => {
        try {
            setLoading(true);

            // Получаем все блюда
            const dishesData = await restaurantService.getAllDishes();
            console.log('All dishes:', dishesData);
            setDishes(dishesData);
            setFilteredDishes(dishesData);

            // Получаем рестораны для фильтра
            const restaurantsData = await restaurantService.getAllRestaurants();
            setRestaurants(restaurantsData);

            setError(null);
        } catch (err) {
            console.error('Failed to fetch menu:', err);
            setError('Не удалось загрузить меню');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleRestaurantChange = (e) => {
        setSelectedRestaurant(e.target.value);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка меню...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    <h2>{error}</h2>
                    <button onClick={fetchData} className="btn btn-primary">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>Меню всех ресторанов</h1>
                <p>Выберите блюдо для добавления в корзину</p>
            </div>

            {/* Фильтры и поиск */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Поиск блюд..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                <div className="restaurant-filter">
                    <select
                        value={selectedRestaurant}
                        onChange={handleRestaurantChange}
                        className="filter-select"
                    >
                        <option value="all">Все рестораны</option>
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-info">
                    <p>Найдено блюд: {filteredDishes.length}</p>
                </div>
            </div>

            {/* Список блюд */}
            {filteredDishes.length === 0 ? (
                <div className="empty-state">
                    <h2>Блюд не найдено</h2>
                    <p>Попробуйте изменить фильтры или поисковый запрос</p>
                </div>
            ) : (
                <div className="dish-grid">
                    {filteredDishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            restaurantId={dish.restaurantId}
                            showRestaurantInfo={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Menu;