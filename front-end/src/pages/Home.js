import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import { restaurantService } from '../services/api';
import { FaSearch, FaFire, FaStar, FaClock, FaTruck, FaUtensils } from 'react-icons/fa';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('');

    const cuisines = ['Все', 'Italian', 'Chinese', 'American', 'Japanese', 'Mexican', 'French', 'Indian', 'Thai'];

    useEffect(() => {
        fetchRestaurants();
        fetchDishes();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getAllRestaurants();
            setRestaurants(response.data.slice(0, 4));
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDishes = async () => {
        try {
            const response = await restaurantService.getAllDishes();
            setDishes(response.data.slice(0, 6));
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Здесь будет реализация поиска
        console.log('Searching for:', searchQuery);
    };

    const handleCuisineFilter = (cuisine) => {
        setSelectedCuisine(cuisine === 'Все' ? '' : cuisine);
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Доставка вкусной еды прямо к вам домой</h1>
                    <p style={styles.heroSubtitle}>Более 1000 ресторанов и тысячи блюд на выбор. Быстрая доставка в любую точку города.</p>

                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <div style={styles.searchContainer}>
                            <FaSearch style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Найдите ресторан или блюдо..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button type="submit" style={styles.searchButton}>Найти</button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.features}>
                <div style={styles.featureGrid}>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaTruck />
                        </div>
                        <h3 style={styles.featureTitle}>Быстрая доставка</h3>
                        <p style={styles.featureText}>Доставка за 30-60 минут в любую точку города</p>
                    </div>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaStar />
                        </div>
                        <h3 style={styles.featureTitle}>Только лучшие рестораны</h3>
                        <p style={styles.featureText}>Проверенные рестораны с высоким рейтингом</p>
                    </div>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaClock />
                        </div>
                        <h3 style={styles.featureTitle}>Круглосуточно</h3>
                        <p style={styles.featureText}>Заказывайте когда удобно, мы работаем 24/7</p>
                    </div>
                    <div style={styles.feature}>
                        <div style={styles.featureIcon}>
                            <FaUtensils />
                        </div>
                        <h3 style={styles.featureTitle}>Широкий выбор</h3>
                        <p style={styles.featureText}>Более 1000 блюд из разных кухонь мира</p>
                    </div>
                </div>
            </section>

            {/* Popular Restaurants */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        <FaFire style={{ marginRight: '10px', color: '#ff6b35' }} />
                        Популярные рестораны
                    </h2>
                    <Link to="/restaurants" style={styles.viewAllLink}>
                        Посмотреть все →
                    </Link>
                </div>

                {loading ? (
                    <div style={styles.loading}>Загрузка ресторанов...</div>
                ) : (
                    <div style={styles.restaurantGrid}>
                        {restaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </section>

            {/* Cuisine Filter */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Выберите кухню</h2>
                <div style={styles.cuisineGrid}>
                    {cuisines.map(cuisine => (
                        <button
                            key={cuisine}
                            onClick={() => handleCuisineFilter(cuisine)}
                            style={{
                                ...styles.cuisineButton,
                                ...(selectedCuisine === cuisine || (cuisine === 'Все' && !selectedCuisine)
                                    ? styles.cuisineButtonActive
                                    : {})
                            }}
                        >
                            {cuisine}
                        </button>
                    ))}
                </div>
            </section>

            {/* Featured Dishes */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Популярные блюда</h2>
                    <Link to="/menu" style={styles.viewAllLink}>
                        Посмотреть все →
                    </Link>
                </div>

                <div style={styles.dishGrid}>
                    {dishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} />
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Закажите сейчас и получите скидку 20% на первый заказ!</h2>
                    <p style={styles.ctaText}>Скачайте наше приложение для дополнительных бонусов и удобства.</p>
                    <div style={styles.ctaButtons}>
                        <button style={styles.ctaButtonPrimary}>Сделать заказ</button>
                        <button style={styles.ctaButtonSecondary}>Скачать приложение</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px 0',
    },
    hero: {
        background: 'linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)',
        borderRadius: '20px',
        padding: '60px 40px',
        marginBottom: '40px',
        color: 'white',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroTitle: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'white',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '40px',
        opacity: 0.9,
    },
    searchForm: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    searchContainer: {
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '50px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    searchIcon: {
        padding: '15px',
        color: '#666',
        fontSize: '1.2rem',
    },
    searchInput: {
        flex: 1,
        border: 'none',
        padding: '15px',
        fontSize: '1rem',
        outline: 'none',
    },
    searchButton: {
        backgroundColor: '#2c3e50',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        ':hover': {
            backgroundColor: '#34495e',
        },
    },
    features: {
        marginBottom: '60px',
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
    },
    feature: {
        textAlign: 'center',
        padding: '20px',
    },
    featureIcon: {
        width: '60px',
        height: '60px',
        backgroundColor: '#ff6b35',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        margin: '0 auto 20px',
    },
    featureTitle: {
        fontSize: '1.2rem',
        marginBottom: '10px',
        color: '#2c3e50',
    },
    featureText: {
        color: '#7f8c8d',
        fontSize: '0.95rem',
    },
    section: {
        marginBottom: '60px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '2rem',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
    },
    viewAllLink: {
        color: '#ff6b35',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '1rem',
        ':hover': {
            textDecoration: 'underline',
        },
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#7f8c8d',
    },
    restaurantGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
    },
    cuisineGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '30px',
    },
    cuisineButton: {
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '25px',
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
    dishGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '25px',
    },
    ctaSection: {
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderRadius: '20px',
        padding: '60px 40px',
        color: 'white',
        textAlign: 'center',
    },
    ctaContent: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    ctaTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'white',
    },
    ctaText: {
        fontSize: '1.1rem',
        marginBottom: '30px',
        opacity: 0.9,
    },
    ctaButtons: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaButtonPrimary: {
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '50px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
            transform: 'translateY(-2px)',
        },
    },
    ctaButtonSecondary: {
        backgroundColor: 'transparent',
        color: 'white',
        border: '2px solid white',
        padding: '15px 30px',
        borderRadius: '50px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: 'white',
            color: '#2c3e50',
        },
    },
};

export default Home;