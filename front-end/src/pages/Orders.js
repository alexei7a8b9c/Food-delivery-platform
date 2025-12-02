import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCheckCircle, FaClock, FaTruck, FaTimesCircle } from 'react-icons/fa';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

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

    const getStatusIcon = (status) => {
        switch(status) {
            case 'DELIVERED': return <FaCheckCircle color="green" />;
            case 'PREPARING': return <FaClock color="orange" />;
            case 'OUT_FOR_DELIVERY': return <FaTruck color="blue" />;
            case 'CANCELLED': return <FaTimesCircle color="red" />;
            default: return <FaClock color="gray" />;
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading orders...</div>;
    }

    return (
        <div className="orders-page">
            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center mt-20">
                    <p>No orders yet. Start ordering delicious food!</p>
                </div>
            ) : (
                <div className="orders-list mt-20">
                    {orders.map(order => (
                        <div key={order.id} className="order-card card">
                            <div className="order-header flex-between">
                                <div>
                                    <h3>Order #{order.id}</h3>
                                    <p className="order-date">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="order-status">
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                            </div>

                            <div className="order-details mt-20">
                                <div className="order-items">
                                    <h4>Items:</h4>
                                    <ul>
                                        {order.items?.map((item, index) => (
                                            <li key={index}>
                                                {item.dishName} x {item.quantity} - ${((item.price * item.quantity) / 100).toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="order-total">
                                    <strong>Total: ${(order.totalPrice / 100).toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;