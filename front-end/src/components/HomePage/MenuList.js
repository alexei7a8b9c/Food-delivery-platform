import React, { useState, useEffect } from 'react';
import { dishApi } from '../../services/api';

const MenuList = ({ restaurantId, onAddToCart }) => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        if (restaurantId) {
            loadDishes();
        } else {
            setDishes([]);
        }
    }, [restaurantId]);

    const loadDishes = async () => {
        if (!restaurantId) {
            setDishes([]);
            return;
        }

        setLoading(true);
        try {
            console.log('Loading dishes for restaurant:', restaurantId);

            // Получаем все блюда и фильтруем на клиенте
            const response = await dishApi.getAll({
                page: 0,
                size: 1000, // Получаем много блюд для фильтрации
                sortBy: 'name',
                sortDirection: 'asc'
            });

            console.log('All dishes response:', response.data);

            // Фильтруем блюда по restaurantId
            let filteredDishes = (response.data.content || []).filter(dish =>
                dish.restaurantId == restaurantId
            );

            // Применяем поиск по названию и описанию
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredDishes = filteredDishes.filter(dish =>
                    dish.name.toLowerCase().includes(term) ||
                    (dish.description && dish.description.toLowerCase().includes(term))
                );
            }

            // Применяем фильтр по цене
            if (minPrice) {
                const min = parseFloat(minPrice);
                filteredDishes = filteredDishes.filter(dish =>
                    parseFloat(dish.price) >= min
                );
            }

            if (maxPrice) {
                const max = parseFloat(maxPrice);
                filteredDishes = filteredDishes.filter(dish =>
                    parseFloat(dish.price) <= max
                );
            }

            console.log('Filtered dishes:', filteredDishes);
            setDishes(filteredDishes);
        } catch (error) {
            console.error('Error loading dishes:', error);
            // Показываем пользователю более информативное сообщение
            if (error.response) {
                console.error('Response error:', error.response.status, error.response.data);
            }
            setDishes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadDishes();
    };

    const handleClear = () => {
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        if (restaurantId) {
            loadDishes();
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Загрузка меню...</p>
            </div>
        );
    }

    return (
        <div className="menu-list">
            <div className="menu-header">
                <h2 className="section-title">Меню</h2>

                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Поиск блюд по названию или описанию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <div className="price-filters">
                        <input
                            type="number"
                            placeholder="Мин. цена"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="price-input"
                            min="0"
                            step="0.01"
                        />
                        <input
                            type="number"
                            placeholder="Макс. цена"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="price-input"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="search-buttons">
                        <button type="submit" className="btn btn-search">
                            🔍 Поиск
                        </button>
                        <button type="button" onClick={handleClear} className="btn btn-clear">
                            ❌ Очистить
                        </button>
                    </div>
                </form>
            </div>

            {!restaurantId ? (
                <div className="empty-state">
                    <div className="empty-icon">🏪</div>
                    <h3>Выберите ресторан</h3>
                    <p>Пожалуйста, выберите ресторан из списка слева</p>
                </div>
            ) : dishes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>Блюд не найдено</h3>
                    <p>У этого ресторана пока нет блюд в меню</p>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        Чтобы добавить блюда, перейдите на страницу администрирования
                    </p>
                </div>
            ) : (
                <div className="dishes-grid">
                    {dishes.map(dish => (
                        <div key={dish.id} className="dish-card">
                            {dish.imageUrl && (
                                <div className="dish-image">
                                    <img src={dish.imageUrl} alt={dish.name} />
                                </div>
                            )}

                            <div className="dish-content">
                                <div className="dish-header">
                                    <h3 className="dish-name">{dish.name}</h3>
                                    <span className="dish-price">${parseFloat(dish.price).toFixed(2)}</span>
                                </div>

                                {dish.description && (
                                    <p className="dish-description">{dish.description}</p>
                                )}

                                <button
                                    onClick={() => onAddToCart(dish)}
                                    className="btn btn-add-to-cart"
                                >
                                    + Добавить в корзину
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuList;