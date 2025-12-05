import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService } from '../services/api';
import DishCard from '../components/DishCard';
import { FaStar, FaClock, FaTruck, FaMapMarkerAlt, FaPhone, FaUtensils, FaHeart, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [isFavorite, setIsFavorite] = useState(false);
    const [rating, setRating] = useState(4.5);

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const fetchRestaurantDetails = async () => {
        try {
            setLoading(true);

            // Fetch restaurant details
            const restaurantResponse = await restaurantService.getRestaurantById(id);
            setRestaurant(restaurantResponse.data);

            // Fetch restaurant dishes
            const dishesResponse = await restaurantService.getDishesByRestaurant(id);
            setDishes(dishesResponse.data);

        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            setError('Не удалось загрузить информацию о ресторане');
            toast.error('Ошибка загрузки ресторана');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Все', ...new Set(dishes.map(dish => dish.category || 'Основные'))];

    const filteredDishes = selectedCategory === 'Все'
        ? dishes
        : dishes.filter(dish => dish.category === selectedCategory || (!dish.category && selectedCategory === 'Основные'));

    const handleAddToFavorites = () => {
        setIsFavorite(!isFavorite);
        toast.success(!isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: restaurant?.name,
                text: `Посмотрите ${restaurant?.name} на Food Delivery`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Ссылка скопирована в буфер обмена');
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Загрузка информации о ресторане...</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div style={styles.errorContainer}>
                <h2>Ресторан не найден</h2>
                <p>{error || 'Запрошенный ресторан не существует'}</p>
                <Link to="/restaurants" style={styles.backButton}>
                    Вернуться к ресторанам
                </Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Restaurant Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.headerImage}>
                        <div style={styles.imagePlaceholder}>
                            <FaUtensils style={styles.placeholderIcon} />
                        </div>
                    </div>

                    <div style={styles.headerInfo}>
                        <div style={styles.titleSection}>
                            <h1 style={styles.title}>{restaurant.name}</h1>
                            <div style={styles.actions}>
                                <button onClick={handleAddToFavorites} style={styles.favoriteButton}>
                                    <FaHeart style={isFavorite ? { color: '#e74c3c' } : {}} />
                                    {isFavorite ? 'В избранном' : 'В избранное'}
                                </button>
                                <button onClick={handleShare} style={styles.shareButton}>
                                    <FaShare />
                                    Поделиться
                                </button>
                            </div>
                        </div>

                        <div style={styles.ratingSection}>
                            <div style={styles.rating}>
                                <FaStar style={styles.starIcon} />
                                <span style={styles.ratingValue}>{rating.toFixed(1)}</span>
                                <span style={styles.ratingCount}>(128 отзывов)</span>
                            </div>
                            <span style={styles.cuisineBadge}>{restaurant.cuisine}</span>
                        </div>

                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <FaClock style={styles.infoIcon} />
                                <div>
                                    <div style={styles.infoLabel}>Время доставки</div>
                                    <div style={styles.infoValue}>30-45 мин</div>
                                </div>
                            </div>
                            <div style={styles.infoItem}>
                                <FaTruck style={styles.infoIcon} />
                                <div>
                                    <div style={styles.infoLabel}>Стоимость доставки</div>
                                    <div style={styles.infoValue}>150 ₽</div>
                                </div>
                            </div>
                            <div style={styles.infoItem}>
                                <FaMapMarkerAlt style={styles.infoIcon} />
                                <div>
                                    <div style={styles.infoLabel}>Адрес</div>
                                    <div style={styles.infoValue}>{restaurant.address}</div>
                                </div>
                            </div>
                            <div style={styles.infoItem}>
                                <FaPhone style={styles.infoIcon} />
                                <div>
                                    <div style={styles.infoLabel}>Телефон</div>
                                    <div style={styles.infoValue}>+7 (999) 123-45-67</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.description}>
                            <p>Ресторан {restaurant.cuisine.toLowerCase()} кухни предлагает широкий выбор блюд, приготовленных из свежих ингредиентов. Идеально подходит для семейного ужина, романтического свидания или бизнес-ланча.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div style={styles.categoriesSection}>
                <h2 style={styles.sectionTitle}>Меню</h2>
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

            {/* Dishes Grid */}
            <div style={styles.dishesSection}>
                {filteredDishes.length === 0 ? (
                    <div style={styles.noDishes}>
                        <h3>Блюда не найдены</h3>
                        <p>В этой категории пока нет блюд</p>
                    </div>
                ) : (
                    <div style={styles.dishesGrid}>
                        {filteredDishes.map(dish => (
                            <DishCard
                                key={dish.id}
                                dish={{ ...dish, restaurantId: restaurant.id }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div style={styles.reviewsSection}>
                <h2 style={styles.sectionTitle}>Отзывы</h2>
                <div style={styles.reviews}>
                    {[1, 2, 3].map(review => (
                        <div key={review} style={styles.reviewCard}>
                            <div style={styles.reviewHeader}>
                                <div style={styles.reviewer}>
                                    <div style={styles.avatar}>АК</div>
                                    <div>
                                        <div style={styles.reviewerName}>Алексей К.</div>
                                        <div style={styles.reviewDate}>2 недели назад</div>
                                    </div>
                                </div>
                                <div style={styles.reviewRating}>
                                    <FaStar style={{ color: '#f39c12', marginRight: '5px' }} />
                                    <span>5.0</span>
                                </div>
                            </div>
                            <p style={styles.reviewText}>
                                Отличный ресторан! Заказываем здесь регулярно. Блюда всегда свежие и вкусные, доставка быстрая. Особенно рекомендую их фирменные блюда.
                            </p>
                        </div>
                    ))}
                </div>
                <button style={styles.showAllReviews}>
                    Показать все отзывы
                </button>
            </div>

            {/* Similar Restaurants */}
            <div style={styles.similarSection}>
                <h2 style={styles.sectionTitle}>Похожие рестораны</h2>
                <div style={styles.similarGrid}>
                    {[1, 2, 3].map(item => (
                        <div key={item} style={styles.similarCard}>
                            <div style={styles.similarImage}>
                                <FaUtensils style={styles.similarIcon} />
                            </div>
                            <div style={styles.similarInfo}>
                                <h3 style={styles.similarTitle}>Ресторан {restaurant.cuisine}</h3>
                                <div style={styles.similarRating}>
                                    <FaStar style={{ color: '#f39c12', fontSize: '0.9rem' }} />
                                    <span>4.8</span>
                                </div>
                                <div style={styles.similarCuisine}>{restaurant.cuisine}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '20px',
    },
    backButton: {
        display: 'inline-block',
        backgroundColor: '#ff6b35',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        textDecoration: 'none',
        marginTop: '20px',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    header: {
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        overflow: 'hidden',
    },
    headerContent: {
        display: 'flex',
        flexDirection: 'column',
        '@media (min-width: 768px)': {
            flexDirection: 'row',
        },
    },
    headerImage: {
        width: '100%',
        height: '300px',
        backgroundColor: '#f8f9fa',
        '@media (min-width: 768px)': {
            width: '40%',
            height: 'auto',
        },
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e9ecef',
    },
    placeholderIcon: {
        fontSize: '80px',
        color: '#adb5bd',
    },
    headerInfo: {
        padding: '30px',
        flex: 1,
    },
    titleSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    actions: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    favoriteButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#e74c3c',
            color: '#e74c3c',
        },
    },
    shareButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#3498db',
            color: '#3498db',
        },
    },
    ratingSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '25px',
        flexWrap: 'wrap',
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#f8f9fa',
        padding: '8px 15px',
        borderRadius: '20px',
    },
    starIcon: {
        color: '#f39c12',
        fontSize: '1rem',
    },
    ratingValue: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    ratingCount: {
        fontSize: '0.9rem',
        color: '#95a5a6',
    },
    cuisineBadge: {
        backgroundColor: '#ff6b35',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
        paddingBottom: '25px',
        borderBottom: '1px solid #e9ecef',
    },
    infoItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
    },
    infoIcon: {
        fontSize: '1.2rem',
        color: '#ff6b35',
        marginTop: '3px',
        flexShrink: 0,
    },
    infoLabel: {
        fontSize: '0.8rem',
        color: '#95a5a6',
        marginBottom: '3px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    infoValue: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    description: {
        color: '#7f8c8d',
        lineHeight: 1.6,
        fontSize: '0.95rem',
    },
    categoriesSection: {
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    categories: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px',
    },
    categoryButton: {
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '25px',
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
    categoryButtonActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        color: 'white',
    },
    dishesSection: {
        marginBottom: '40px',
    },
    noDishes: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    dishesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '25px',
    },
    reviewsSection: {
        marginBottom: '40px',
    },
    reviews: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    reviewCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
    },
    reviewer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    avatar: {
        width: '40px',
        height: '40px',
        backgroundColor: '#3498db',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    reviewerName: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '0.95rem',
    },
    reviewDate: {
        fontSize: '0.8rem',
        color: '#95a5a6',
    },
    reviewRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#f8f9fa',
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    reviewText: {
        color: '#7f8c8d',
        lineHeight: 1.5,
        fontSize: '0.9rem',
    },
    showAllReviews: {
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '12px 25px',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    similarSection: {
        marginBottom: '40px',
    },
    similarGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
    },
    similarCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        },
    },
    similarImage: {
        width: '60px',
        height: '60px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    similarIcon: {
        fontSize: '24px',
        color: '#adb5bd',
    },
    similarInfo: {
        flex: 1,
    },
    similarTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '5px',
    },
    similarRating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9rem',
        color: '#f39c12',
        marginBottom: '5px',
    },
    similarCuisine: {
        fontSize: '0.8rem',
        color: '#95a5a6',
        backgroundColor: '#f8f9fa',
        padding: '3px 8px',
        borderRadius: '12px',
        display: 'inline-block',
    },
};

export default RestaurantDetail;