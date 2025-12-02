import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';
import { FaSearch, FaUtensils, FaShippingFast, FaStar } from 'react-icons/fa';

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const data = await restaurantService.getAllRestaurants();
            setRestaurants(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
            setError('Failed to load restaurants. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-20">
                <div className="spinner"></div>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-20">
                <div className="alert alert-error">{error}</div>
                <button onClick={fetchRestaurants} className="btn btn-primary mt-10">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="hero-section">
                <h1>Delicious Food Delivered to Your Door</h1>
                <p>Order from your favorite restaurants and enjoy fresh meals at home</p>

                <div className="search-section mt-20">
                    <Link to="/restaurants" className="btn btn-primary btn-lg">
                        <FaSearch /> Browse All Restaurants
                    </Link>
                </div>
            </div>

            <div className="features-section grid grid-3 mt-20">
                <div className="feature-card text-center">
                    <FaUtensils size={40} />
                    <h3>Wide Selection</h3>
                    <p>Choose from {restaurants.length} restaurants</p>
                </div>
                <div className="feature-card text-center">
                    <FaShippingFast size={40} />
                    <h3>Fast Delivery</h3>
                    <p>Get your food delivered in 30 minutes</p>
                </div>
                <div className="feature-card text-center">
                    <FaStar size={40} />
                    <h3>Best Quality</h3>
                    <p>Fresh ingredients and delicious meals</p>
                </div>
            </div>

            <div className="restaurants-section mt-20">
                <h2>Popular Restaurants</h2>
                {restaurants.length === 0 ? (
                    <div className="text-center mt-20">
                        <p>No restaurants available at the moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-3 mt-20">
                            {restaurants.slice(0, 6).map(restaurant => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>

                        {restaurants.length > 6 && (
                            <div className="text-center mt-20">
                                <Link to="/restaurants" className="btn btn-primary">
                                    View All Restaurants
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;