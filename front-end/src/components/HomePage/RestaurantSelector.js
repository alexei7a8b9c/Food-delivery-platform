import React from 'react';

const RestaurantSelector = ({ restaurants, selectedRestaurant, onSelect }) => {
    return (
        <div className="restaurant-selector">
            <h2 className="section-title">Выберите ресторан</h2>
            <div className="restaurant-list">
                {restaurants.map(restaurant => (
                    <div
                        key={restaurant.id}
                        className={`restaurant-item ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                        onClick={() => onSelect(restaurant)}
                    >
                        <div className="restaurant-item-content">
                            <div className="restaurant-icon">🏪</div>
                            <div className="restaurant-details">
                                <h3 className="restaurant-item-name">{restaurant.name}</h3>
                                <p className="restaurant-item-cuisine">{restaurant.cuisine}</p>
                                <p className="restaurant-item-address">{restaurant.address}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RestaurantSelector;