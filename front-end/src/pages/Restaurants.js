import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import restaurantService from '../services/restaurantService';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchCuisine, setSearchCuisine] = useState('');
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // Количество ресторанов на странице

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        if (searchCuisine.trim() === '') {
            setFilteredRestaurants(restaurants);
        } else {
            const filtered = restaurants.filter(restaurant =>
                restaurant.cuisine.toLowerCase().includes(searchCuisine.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        }
        setCurrentPage(1); // Сбросить на первую страницу при фильтрации
    }, [searchCuisine, restaurants]);

    // Рассчитываем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRestaurants = filteredRestaurants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

    // Функции для смены страниц
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchRestaurants = async () => {
        try {
            const response = await restaurantService.getAllRestaurants();
            setRestaurants(response.data);
            setFilteredRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading restaurants...</div>;

    return (
        <div>
            <h2>All Restaurants ({restaurants.length} total)</h2>
            <div>
                <input
                    type="text"
                    placeholder="Search by cuisine (Italian, Chinese, etc.)"
                    value={searchCuisine}
                    onChange={(e) => setSearchCuisine(e.target.value)}
                />
            </div>

            {/* Пагинация сверху */}
            <div style={{ margin: '20px 0' }}>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredRestaurants.length === 0}
                >
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
                    {filteredRestaurants.length > 0 && ` (Showing ${currentRestaurants.length} of ${filteredRestaurants.length} restaurants)`}
        </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || filteredRestaurants.length === 0}
                >
                    Next
                </button>

                {/* Номера страниц */}
                <div style={{ marginTop: '10px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                        <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            style={{
                                margin: '0 5px',
                                padding: '5px 10px',
                                backgroundColor: currentPage === pageNumber ? '#000' : 'white',
                                color: currentPage === pageNumber ? 'white' : 'black',
                                border: '1px solid black'
                            }}
                            disabled={filteredRestaurants.length === 0}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {filteredRestaurants.length === 0 ? (
                    <p>No restaurants found</p>
                ) : (
                    <div>
                        {currentRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </div>

            {/* Пагинация снизу */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredRestaurants.length === 0}
                >
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || filteredRestaurants.length === 0}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Restaurants;