import React, { useState, useEffect } from 'react';
import DishCard from '../components/DishCard';
import restaurantService from '../services/restaurantService';

const Menu = () => {
    const [dishes, setDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [loading, setLoading] = useState(true);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Количество блюд на странице

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '' && !selectedRestaurant) {
            setFilteredDishes(dishes);
        } else {
            const filtered = dishes.filter(dish => {
                const matchesSearch = searchQuery.trim() === '' ||
                    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dish.description.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesRestaurant = !selectedRestaurant ||
                    dish.restaurantId == selectedRestaurant;

                return matchesSearch && matchesRestaurant;
            });
            setFilteredDishes(filtered);
        }
        setCurrentPage(1); // Сбросить на первую страницу при фильтрации
    }, [searchQuery, selectedRestaurant, dishes]);

    // Рассчитываем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);

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

    const fetchAllData = async () => {
        try {
            const [dishesRes, restaurantsRes] = await Promise.all([
                restaurantService.getAllDishes(),
                restaurantService.getAllRestaurants()
            ]);

            console.log('Dishes from API:', dishesRes.data);
            console.log('Restaurants from API:', restaurantsRes.data);

            setDishes(dishesRes.data);
            setFilteredDishes(dishesRes.data);
            setRestaurants(restaurantsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRestaurantName = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id == restaurantId);
        return restaurant ? restaurant.name : `Restaurant ${restaurantId}`;
    };

    if (loading) return <div>Loading menu...</div>;

    return (
        <div>
            <h2>All Dishes ({dishes.length} total)</h2>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '300px', padding: '8px' }}
                    />
                </div>

                <div>
                    <label style={{ marginRight: '10px' }}>Filter by Restaurant:</label>
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="">All Restaurants</option>
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name} ({restaurant.cuisine})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Пагинация сверху */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredDishes.length === 0}
                >
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
                    {filteredDishes.length > 0 && ` (Showing ${currentDishes.length} of ${filteredDishes.length} dishes)`}
        </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || filteredDishes.length === 0}
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
                            disabled={filteredDishes.length === 0}
                        >
                            {pageNumber}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {filteredDishes.length === 0 ? (
                    <div>
                        <p>No dishes found</p>
                        <button onClick={fetchAllData}>Reload Menu</button>
                    </div>
                ) : (
                    <div>
                        <div>
                            {currentDishes.map(dish => (
                                <div key={dish.id} style={{ marginBottom: '20px' }}>
                                    <DishCard
                                        dish={dish}
                                        restaurantId={dish.restaurantId}
                                    />
                                    <div style={{ fontSize: '12px', color: 'gray', marginLeft: '10px' }}>
                                        Restaurant: {getRestaurantName(dish.restaurantId)} (ID: {dish.restaurantId})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Пагинация снизу */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || filteredDishes.length === 0}
                >
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || filteredDishes.length === 0}
                >
                    Next
                </button>
            </div>

            <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                <h3>Debug Information</h3>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <p>Total dishes: {dishes.length}</p>
                    <p>Total restaurants: {restaurants.length}</p>
                    <p>Filtered dishes: {filteredDishes.length}</p>
                    <p>Sample dish data:</p>
                    {dishes.slice(0, 3).map(dish => (
                        <div key={dish.id} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                            ID: {dish.id}, Name: {dish.name}, RestaurantID: {dish.restaurantId}, Price: {dish.price}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Menu;