import React, { useState, useEffect } from 'react';
import { dishApi } from '../../services/api';

const MenuList = ({ restaurantId, onAddToCart }) => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        if (restaurantId) {
            loadDishes();
        } else {
            setDishes([]);
        }
    }, [restaurantId]);

    const loadDishes = async () => {
        if (!restaurantId) {
            setDishes([]);
            return;
        }

        setLoading(true);
        try {
            console.log('Loading dishes for restaurant:', restaurantId);

            // Get all dishes and filter on the client side
            const response = await dishApi.getAll({
                page: 0,
                size: 1000, // Get many dishes for filtering
                sortBy: 'name',
                sortDirection: 'asc'
            });

            console.log('All dishes response:', response.data);

            // Filter dishes by restaurantId
            let filteredDishes = (response.data.content || []).filter(dish =>
                dish.restaurantId == restaurantId
            );

            // Apply search by name and description
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredDishes = filteredDishes.filter(dish =>
                    dish.name.toLowerCase().includes(term) ||
                    (dish.description && dish.description.toLowerCase().includes(term))
                );
            }

            // Apply price filter
            if (minPrice) {
                const min = parseFloat(minPrice);
                filteredDishes = filteredDishes.filter(dish =>
                    parseFloat(dish.price) >= min
                );
            }

            if (maxPrice) {
                const max = parseFloat(maxPrice);
                filteredDishes = filteredDishes.filter(dish =>
                    parseFloat(dish.price) <= max
                );
            }

            console.log('Filtered dishes:', filteredDishes);
            setDishes(filteredDishes);
        } catch (error) {
            console.error('Error loading dishes:', error);
            // Show a more informative message to the user
            if (error.response) {
                console.error('Response error:', error.response.status, error.response.data);
            }
            setDishes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadDishes();
    };

    const handleClear = () => {
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        if (restaurantId) {
            loadDishes();
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="menu-list">
            <div className="menu-header">
                <h2 className="section-title">Menu</h2>

                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search dishes by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <div className="price-filters">
                        <input
                            type="number"
                            placeholder="Min. price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="price-input"
                            min="0"
                            step="0.01"
                        />
                        <input
                            type="number"
                            placeholder="Max. price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="price-input"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="search-buttons">
                        <button type="submit" className="btn btn-search">
                            🔍 Search
                        </button>
                        <button type="button" onClick={handleClear} className="btn btn-clear">
                            ❌ Clear
                        </button>
                    </div>
                </form>
            </div>

            {!restaurantId ? (
                <div className="empty-state">
                    <div className="empty-icon">🏪</div>
                    <h3>Select a restaurant</h3>
                    <p>Please select a restaurant from the list on the left</p>
                </div>
            ) : dishes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>No dishes found</h3>
                    <p>This restaurant doesn't have any dishes in the menu yet</p>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        To add dishes, go to the administration page
                    </p>
                </div>
            ) : (
                <div className="dishes-grid">
                    {dishes.map(dish => (
                        <div key={dish.id} className="dish-card">
                            {dish.imageUrl && (
                                <div className="dish-image">
                                    <img src={dish.imageUrl} alt={dish.name} />
                                </div>
                            )}

                            <div className="dish-content">
                                <div className="dish-header">
                                    <h3 className="dish-name">{dish.name}</h3>
                                    <span className="dish-price">${parseFloat(dish.price).toFixed(2)}</span>
                                </div>

                                {dish.description && (
                                    <p className="dish-description">{dish.description}</p>
                                )}

                                <button
                                    onClick={() => onAddToCart(dish)}
                                    className="btn btn-add-to-cart"
                                >
                                    + Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuList;