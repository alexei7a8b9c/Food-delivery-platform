import React, { useState, useEffect } from 'react';
import { restaurantService } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { FaSearch, FaFilter, FaStar, FaClock, FaTruck, FaSortAmountDown } from 'react-icons/fa';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('Все');
    const [sortBy, setSortBy] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [deliveryTime, setDeliveryTime] = useState(60);

    const cuisines = ['Все', 'Italian', 'Chinese', 'American', 'Japanese', 'Mexican', 'French', 'Indian', 'Thai'];
    const sortOptions = [
        { value: 'rating', label: 'По рейтингу', icon: <FaStar /> },
        { value: 'delivery', label: 'По времени доставки', icon: <FaClock /> },
        { value: 'price', label: 'По цене', icon: <FaTruck /> },
        { value: 'name', label: 'По названию', icon: <FaSortAmountDown /> }
    ];

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterAndSortRestaurants();
    }, [restaurants, searchQuery, selectedCuisine, sortBy, priceRange, deliveryTime]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getAllRestaurants();
            setRestaurants(response.data);
            setFilteredRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Не удалось загрузить рестораны. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortRestaurants = () => {
        let filtered = [...restaurants];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by cuisine
        if (selectedCuisine !== 'Все') {
            filtered = filtered.filter(restaurant =>
                restaurant.cuisine === selectedCuisine
            );
        }

        // Filter by price range (simulated)
        filtered = filtered.filter(restaurant => {
            // Simulate price range filtering
            const avgPrice = Math.random() * 2000 + 500; // Simulated average price
            return avgPrice >= priceRange[0] && avgPrice <= priceRange[1];
        });

        // Filter by delivery time (simulated)
        filtered = filtered.filter(restaurant => {
            const time = Math.random() * 40 + 20; // Simulated delivery time 20-60 min
            return time <= deliveryTime;
        });

        // Sort restaurants
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return 4.5 - 4.2; // Simulated ratings
                case 'delivery':
                    const timeA = Math.random() * 40 + 20;
                    const timeB = Math.random() * 40 + 20;
                    return timeA - timeB;
                case 'price':
                    const priceA = Math.random() * 2000 + 500;
                    const priceB = Math.random() * 2000 + 500;
                    return priceA - priceB;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        setFilteredRestaurants(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        filterAndSortRestaurants();
    };

    const handleCuisineFilter = (cuisine) => {
        setSelectedCuisine(cuisine);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    const handlePriceRangeChange = (index, value) => {
        const newRange = [...priceRange];
        newRange[index] = parseInt(value);
        setPriceRange(newRange);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCuisine('Все');
        setSortBy('rating');
        setPriceRange([0, 10000]);
        setDeliveryTime(60);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Загрузка ресторанов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={fetchRestaurants} style={styles.retryButton}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Search and Filter Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Рестораны</h1>
                <p style={styles.subtitle}>
                    {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'ресторан' :
                    filteredRestaurants.length < 5 ? 'ресторана' : 'ресторанов'} найдено
                </p>
            </div>

            {/* Search Bar */}
            <div style={styles.searchSection}>
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <div style={styles.searchContainer}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Найдите ресторан, кухню или адрес..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button type="submit" style={styles.searchButton}>Поиск</button>
                    </div>
                </form>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={styles.filterToggle}
                >
                    <FaFilter style={{ marginRight: '8px' }} />
                    {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div style={styles.filtersPanel}>
                    <div style={styles.filterSection}>
                        <h3 style={styles.filterTitle}>Кухня</h3>
                        <div style={styles.cuisineFilters}>
                            {cuisines.map(cuisine => (
                                <button
                                    key={cuisine}
                                    onClick={() => handleCuisineFilter(cuisine)}
                                    style={{
                                        ...styles.cuisineButton,
                                        ...(selectedCuisine === cuisine && styles.cuisineButtonActive)
                                    }}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.filterSection}>
                        <h3 style={styles.filterTitle}>Ценовой диапазон</h3>
                        <div style={styles.rangeFilter}>
                            <span style={styles.rangeLabel}>₽{priceRange[0]} - ₽{priceRange[1]}</span>
                            <div style={styles.rangeInputs}>
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="500"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                                    style={styles.rangeSlider}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="500"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                                    style={styles.rangeSlider}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.filterSection}>
                        <h3 style={styles.filterTitle}>Время доставки</h3>
                        <div style={styles.timeFilter}>
                            <span style={styles.timeLabel}>До {deliveryTime} мин</span>
                            <input
                                type="range"
                                min="15"
                                max="120"
                                step="15"
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(parseInt(e.target.value))}
                                style={styles.timeSlider}
                            />
                        </div>
                    </div>

                    <div style={styles.filterActions}>
                        <button onClick={resetFilters} style={styles.resetButton}>
                            Сбросить фильтры
                        </button>
                    </div>
                </div>
            )}

            {/* Sort Options */}
            <div style={styles.sortSection}>
                <div style={styles.sortLabel}>
                    <FaSortAmountDown style={{ marginRight: '8px' }} />
                    Сортировать по:
                </div>
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

            {/* Restaurants Grid */}
            {filteredRestaurants.length === 0 ? (
                <div style={styles.noResults}>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                    <button onClick={resetFilters} style={styles.resetButton}>
                        Сбросить фильтры
                    </button>
                </div>
            ) : (
                <div style={styles.restaurantsGrid}>
                    {filteredRestaurants.map(restaurant => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}

            {/* Pagination (simulated) */}
            {filteredRestaurants.length > 0 && (
                <div style={styles.pagination}>
                    <button style={styles.pageButton} disabled>← Назад</button>
                    <div style={styles.pageNumbers}>
                        <span style={styles.pageActive}>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>...</span>
                        <span>10</span>
                    </div>
                    <button style={styles.pageButton}>Вперед →</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px 0',
        maxWidth: '1200px',
        margin: '0 auto',
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
    searchSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px',
    },
    searchForm: {
        flex: 1,
        minWidth: '300px',
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
    filterToggle: {
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    filtersPanel: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    filterSection: {
        marginBottom: '25px',
        paddingBottom: '25px',
        borderBottom: '1px solid #e9ecef',
        ':last-child': {
            marginBottom: 0,
            paddingBottom: 0,
            borderBottom: 'none',
        },
    },
    filterTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '15px',
    },
    cuisineFilters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    cuisineButton: {
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    cuisineButtonActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        color: 'white',
    },
    rangeFilter: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    rangeLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    rangeInputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    rangeSlider: {
        width: '100%',
        height: '6px',
        WebkitAppearance: 'none',
        backgroundColor: '#e9ecef',
        borderRadius: '3px',
        outline: 'none',
        '::-webkit-slider-thumb': {
            WebkitAppearance: 'none',
            width: '20px',
            height: '20px',
            backgroundColor: '#ff6b35',
            borderRadius: '50%',
            cursor: 'pointer',
        },
    },
    timeFilter: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    timeLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    timeSlider: {
        width: '100%',
        height: '6px',
        WebkitAppearance: 'none',
        backgroundColor: '#e9ecef',
        borderRadius: '3px',
        outline: 'none',
        '::-webkit-slider-thumb': {
            WebkitAppearance: 'none',
            width: '20px',
            height: '20px',
            backgroundColor: '#ff6b35',
            borderRadius: '50%',
            cursor: 'pointer',
        },
    },
    filterActions: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    resetButton: {
        backgroundColor: '#e9ecef',
        color: '#495057',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#dee2e6',
        },
    },
    sortSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    sortLabel: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
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
    restaurantsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '30px',
        marginBottom: '40px',
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '40px',
    },
    pageButton: {
        padding: '10px 20px',
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
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            ':hover': {
                borderColor: '#e9ecef',
                color: '#495057',
            },
        },
    },
    pageNumbers: {
        display: 'flex',
        gap: '10px',
    },
    pageActive: {
        padding: '10px 15px',
        backgroundColor: '#ff6b35',
        color: 'white',
        borderRadius: '6px',
        fontWeight: 'bold',
    },
};

export default Restaurants;