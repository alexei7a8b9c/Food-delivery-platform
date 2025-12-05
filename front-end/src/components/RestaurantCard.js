import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';

const RestaurantCard = ({ restaurant }) => {
    const getCuisineColor = (cuisine) => {
        const colors = {
            'Italian': '#e74c3c',
            'Chinese': '#3498db',
            'American': '#2ecc71',
            'Japanese': '#9b59b6',
            'Mexican': '#e67e22',
            'French': '#1abc9c',
            'Indian': '#f1c40f',
            'Thai': '#d35400',
        };
        return colors[cuisine] || '#95a5a6';
    };

    return (
        <div style={styles.card}>
            <div style={styles.imageContainer}>
                <div style={styles.imagePlaceholder}>
                    <FaUtensils style={styles.placeholderIcon} />
                    <span style={styles.cuisineBadge} style={{ backgroundColor: getCuisineColor(restaurant.cuisine) }}>
            {restaurant.cuisine}
          </span>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{restaurant.name}</h3>
                    <div style={styles.rating}>
                        <FaStar style={styles.starIcon} />
                        <span>4.5</span>
                        <span style={styles.reviews}>(128 отзывов)</span>
                    </div>
                </div>

                <div style={styles.info}>
                    <div style={styles.infoItem}>
                        <FaMapMarkerAlt style={styles.infoIcon} />
                        <span style={styles.infoText}>{restaurant.address}</span>
                    </div>

                    <div style={styles.stats}>
                        <div style={styles.stat}>
                            <span style={styles.statValue}>30-40</span>
                            <span style={styles.statLabel}>мин</span>
                        </div>
                        <div style={styles.stat}>
                            <span style={styles.statValue}>150 ₽</span>
                            <span style={styles.statLabel}>доставка</span>
                        </div>
                        <div style={styles.stat}>
                            <span style={styles.statValue}>200+</span>
                            <span style={styles.statLabel}>блюд</span>
                        </div>
                    </div>
                </div>

                <div style={styles.actions}>
                    <Link to={`/restaurants/${restaurant.id}`} style={styles.viewMenuBtn}>
                        Посмотреть меню
                    </Link>
                    <button style={styles.favoriteBtn}>
                        ♡
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        },
    },
    imageContainer: {
        height: '180px',
        backgroundColor: '#f8f9fa',
        position: 'relative',
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
        fontSize: '48px',
        color: '#adb5bd',
    },
    cuisineBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        color: 'white',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    content: {
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        marginBottom: '15px',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    rating: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#f39c12',
        fontSize: '0.9rem',
    },
    starIcon: {
        fontSize: '0.9rem',
    },
    reviews: {
        color: '#95a5a6',
        fontSize: '0.85rem',
        marginLeft: '5px',
    },
    info: {
        marginBottom: '20px',
        flex: 1,
    },
    infoItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '12px',
        color: '#7f8c8d',
    },
    infoIcon: {
        fontSize: '0.9rem',
        marginTop: '3px',
        flexShrink: 0,
        color: '#95a5a6',
    },
    infoText: {
        fontSize: '0.9rem',
        lineHeight: 1.4,
    },
    stats: {
        display: 'flex',
        gap: '15px',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #ecf0f1',
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#95a5a6',
        textTransform: 'uppercase',
        marginTop: '2px',
        letterSpacing: '0.5px',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        marginTop: 'auto',
    },
    viewMenuBtn: {
        flex: 1,
        backgroundColor: '#ff6b35',
        color: 'white',
        textDecoration: 'none',
        padding: '10px 15px',
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    favoriteBtn: {
        width: '40px',
        backgroundColor: 'transparent',
        border: '2px solid #ddd',
        borderRadius: '6px',
        fontSize: '1.2rem',
        color: '#e74c3c',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ':hover': {
            borderColor: '#e74c3c',
            backgroundColor: '#ffeaea',
        },
    },
};

export default RestaurantCard;