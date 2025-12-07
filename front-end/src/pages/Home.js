import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import DishCard from '../components/DishCard';
import restaurantService from '../services/restaurantService';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [restaurantsRes, dishesRes] = await Promise.all([
                restaurantService.getAllRestaurants(),
                restaurantService.getAllDishes()
            ]);
            setRestaurants(restaurantsRes.data);
            setDishes(dishesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Popular Restaurants</h2>
            <div>
                {restaurants.slice(0, 3).map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>

            <h2>Featured Dishes</h2>
            <div>
                {dishes.slice(0, 6).map(dish => (
                    <DishCard key={dish.id} dish={dish} />
                ))}
            </div>
        </div>
    );
};

export default Home;