import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Orders = () => {
    const { currentUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Количество заказов на странице

    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser]);

    // Рассчитываем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

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

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <div>Please login to view orders</div>;
    }

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h2>My Orders ({orders.length} total)</h2>

            {/* Пагинация сверху */}
            {orders.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>
            Page {currentPage} of {totalPages}
                        {orders.length > 0 && ` (Showing ${currentOrders.length} of ${orders.length} orders)`}
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
            )}

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                currentOrders.map(order => (
                    <div key={order.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                        <h3>Order #{order.id}</h3>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                        <p><strong>Total:</strong> ${(order.totalPrice / 100).toFixed(2)}</p>
                        <p><strong>Restaurant ID:</strong> {order.restaurantId}</p>

                        <h4>Items:</h4>
                        <ul>
                            {order.items && order.items.map((item, index) => (
                                <li key={index}>
                                    {item.quantity}x {item.dishName} - ${(item.price / 100).toFixed(2)} each
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}

            {/* Пагинация снизу */}
            {orders.length > 0 && (
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
            )}
        </div>
    );
};

export default Orders;