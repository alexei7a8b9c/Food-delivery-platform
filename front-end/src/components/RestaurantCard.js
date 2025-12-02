import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUtensils, FaMapMarkerAlt } from 'react-icons/fa';

function RestaurantCard({ restaurant }) {
    if (!restaurant) return null;

    const getCuisineColor = (cuisine) => {
        const colors = {
            'Italian': '#FF6B6B',
            'Chinese': '#4ECDC4',
            'American': '#FFD166',
            'Japanese': '#06D6A0',
            'Mexican': '#EF476F',
            'French': '#118AB2',
        };
        return colors[cuisine] || '#6C757D';
    };

    return (
        <div className="restaurant-card card">
            <div className="restaurant-image">
                <div
                    className="cuisine-badge-large"
                    style={{ backgroundColor: getCuisineColor(restaurant.cuisine) }}
                >
                    <FaUtensils size={24} color="white" />
                </div>
            </div>

            <div className="restaurant-info">
                <h3>{restaurant.name}</h3>
                <div className="cuisine-tag" style={{ backgroundColor: getCuisineColor(restaurant.cuisine) }}>
                    {restaurant.cuisine}
                </div>

                <div className="restaurant-meta">
                    <span><FaMapMarkerAlt /> {restaurant.address.split(',')[0]}</span>
                </div>

                <div className="restaurant-footer">
                    <div className="rating">
                        <FaStar color="#FFD700" />
                        <span>4.5</span>
                        <span className="reviews">(120)</span>
                    </div>

                    <Link to={`/restaurants/${restaurant.id}`} className="btn btn-primary">
                        View Menu
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RestaurantCard;