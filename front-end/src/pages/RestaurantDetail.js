import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DishCard from '../components/DishCard';
import restaurantService from '../services/restaurantService';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Количество блюд на странице

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const fetchRestaurantDetails = async () => {
        try {
            setLoading(true);
            setError('');

            // Получаем информацию о ресторане
            const restaurantRes = await restaurantService.getRestaurantById(id);
            setRestaurant(restaurantRes.data);

            // Получаем блюда ресторана
            const dishesRes = await restaurantService.getRestaurantDishes(id);
            console.log('Dishes response:', dishesRes.data); // Для отладки
            setDishes(dishesRes.data);

        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            setError('Failed to load restaurant details');
        } finally {
            setLoading(false);
        }
    };

    // Рассчитываем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDishes = dishes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(dishes.length / itemsPerPage);

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

    if (loading) return <div>Loading restaurant details...</div>;

    if (error) return <div>Error: {error}</div>;

    if (!restaurant) return <div>Restaurant not found</div>;

    return (
        <div>
            <h2>{restaurant.name}</h2>
            <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
            <p><strong>Address:</strong> {restaurant.address}</p>

            <h3>Menu ({dishes.length} dishes)</h3>

            {dishes.length === 0 ? (
                <div>
                    <p>No dishes available for this restaurant.</p>
                    <button onClick={fetchRestaurantDetails}>Refresh</button>
                </div>
            ) : (
                <div>
                    {/* Пагинация сверху */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span style={{ margin: '0 10px' }}>
              Page {currentPage} of {totalPages}
            </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
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
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Список блюд */}
                    <div>
                        <p>Showing {currentDishes.length} of {dishes.length} dishes</p>
                        {currentDishes.map(dish => (
                            <div key={dish.id} style={{ marginBottom: '20px' }}>
                                <DishCard
                                    dish={dish}
                                    restaurantId={restaurant.id}
                                />
                                <div style={{ fontSize: '12px', color: 'gray', marginLeft: '10px' }}>
                                    Restaurant: {restaurant.name} (ID: {dish.restaurantId})
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагинация снизу */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span style={{ margin: '0 10px' }}>
              Page {currentPage} of {totalPages}
            </span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <button onClick={fetchRestaurantDetails}>Refresh Menu</button>
                <button onClick={() => window.history.back()}>Back to Restaurants</button>
            </div>
        </div>
    );
};

export default RestaurantDetail;