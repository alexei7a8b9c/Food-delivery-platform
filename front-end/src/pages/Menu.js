import React, { useState, useEffect } from 'react';
import DishCard from '../components/DishCard';
import { restaurantApi } from '../services/api';
import { FaSearch, FaFilter, FaStar, FaFire, FaClock } from 'react-icons/fa';

const Menu = () => {
    const [dishes, setDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [sortBy, setSortBy] = useState('popular');

    const categories = ['Все', 'Пицца', 'Суши', 'Бургеры', 'Паста', 'Салаты', 'Десерты', 'Напитки'];
    const sortOptions = [
        { value: 'popular', label: 'Популярные', icon: <FaFire /> },
        { value: 'rating', label: 'По рейтингу', icon: <FaStar /> },
        { value: 'price_low', label: 'Сначала дешевые', icon: <FaClock /> },
        { value: 'price_high', label: 'Сначала дорогие', icon: <FaClock /> },
    ];

    useEffect(() => {
        fetchDishes();
    }, []);

    useEffect(() => {
        filterAndSortDishes();
    }, [dishes, searchQuery, selectedCategory, sortBy]);

    const fetchDishes = async () => {
        try {
            setLoading(true);
            const response = await restaurantApi.getAllDishes();
            setDishes(response.data || []);
            setFilteredDishes(response.data || []);
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setError('Не удалось загрузить меню. Попробуйте позже.');

            // Тестовые данные для разработки
            const mockDishes = [
                {
                    id: 1,
                    name: 'Маргарита',
                    description: 'Классическая пицца с томатным соусом, сыром и базиликом',
                    price: 450,
                    imageUrl: '/images/margherita.jpg',
                    restaurantId: 1
                },
                {
                    id: 2,
                    name: 'Калифорния ролл',
                    description: 'Ролл с крабом, авокадо и огурцом',
                    price: 380,
                    imageUrl: '/images/california.jpg',
                    restaurantId: 4
                },
                // Добавьте больше тестовых блюд по необходимости
            ];

            setDishes(mockDishes);
            setFilteredDishes(mockDishes);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortDishes = () => {
        let filtered = [...dishes];

        // Фильтрация по поиску
        if (searchQuery) {
            filtered = filtered.filter(dish =>
                dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Фильтрация по категории (в реальном приложении у блюд должна быть категория)
        if (selectedCategory !== 'Все') {
            // Здесь должна быть логика фильтрации по реальным категориям
            // Для демо просто пропускаем
        }

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'popular':
                default:
                    return (b.popularity || 0) - (a.popularity || 0);
            }
        });

        setFilteredDishes(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        filterAndSortDishes();
    };

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Загрузка меню...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={fetchDishes} style={styles.retryButton}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Меню</h1>
                <p style={styles.subtitle}>
                    {filteredDishes.length} {filteredDishes.length === 1 ? 'блюдо' :
                    filteredDishes.length < 5 ? 'блюда' : 'блюд'} найдено
                </p>
            </div>

            {/* Search and Filters */}
            <div style={styles.controls}>
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <div style={styles.searchContainer}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Найдите блюдо..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button type="submit" style={styles.searchButton}>
                            Поиск
                        </button>
                    </div>
                </form>

                <div style={styles.filterSection}>
                    <div style={styles.categories}>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    ...styles.categoryButton,
                                    ...(selectedCategory === category && styles.categoryButtonActive)
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.sortSection}>
                    <span style={styles.sortLabel}>Сортировка:</span>
                    <div style={styles.sortOptions}>
                        {sortOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                style={{
                                    ...styles.sortButton,
                                    ...(sortBy === option.value && styles.sortButtonActive)
                                }}
                            >
                                {option.icon}
                                <span style={{ marginLeft: '5px' }}>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dishes Grid */}
            {filteredDishes.length === 0 ? (
                <div style={styles.noResults}>
                    <h3>Блюда не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            ) : (
                <div style={styles.dishesGrid}>
                    {filteredDishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px',
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        borderLeftColor: '#ff6b35',
        animation: 'spin 1s linear infinite',
    },
    errorContainer: {
        textAlign: 'center',
        padding: '50px 20px',
        backgroundColor: '#fff5f5',
        borderRadius: '10px',
        border: '1px solid #feb2b2',
        margin: '20px',
    },
    retryButton: {
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '2.5rem',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1.1rem',
    },
    controls: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '30px',
    },
    searchForm: {
        width: '100%',
    },
    searchContainer: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    searchIcon: {
        padding: '12px 15px',
        color: '#666',
        fontSize: '1.2rem',
        backgroundColor: '#f8f9fa',
    },
    searchInput: {
        flex: 1,
        border: 'none',
        padding: '12px 15px',
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: 'white',
    },
    searchButton: {
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '12px 25px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    filterSection: {
        overflowX: 'auto',
        paddingBottom: '10px',
    },
    categories: {
        display: 'flex',
        gap: '10px',
        minWidth: 'min-content',
    },
    categoryButton: {
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    categoryButtonActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        color: 'white',
    },
    sortSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
    },
    sortLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    sortOptions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    sortButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 15px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    sortButtonActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        color: 'white',
    },
    dishesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '25px',
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
};

export default Menu;