import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
    return (
        <div style={{
            border: '1px solid black',
            margin: '10px',
            padding: '10px',
            backgroundColor: 'white'
        }}>
            <h3>{restaurant.name}</h3>
            <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
            <p><strong>Address:</strong> {restaurant.address}</p>
            <Link to={`/restaurant/${restaurant.id}`}>
                <button>View Menu</button>
            </Link>
        </div>
    );
};

export default RestaurantCard;