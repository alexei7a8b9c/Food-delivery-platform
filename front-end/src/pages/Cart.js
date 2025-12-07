import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import api from '../services/api';

const Cart = () => {
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            setError('Cart is empty');
            return;
        }

        const restaurantId = cartItems[0]?.restaurantId;
        if (!restaurantId) {
            setError('Invalid cart items');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderItems = cartItems.map(item => ({
                dishId: item.dishId,
                quantity: item.quantity,
                price: item.price,
                dishName: item.dishName,
                dishDescription: item.dishDescription
            }));

            const orderRequest = {
                restaurantId,
                items: orderItems,
                paymentMethod: 'CREDIT_CARD'
            };

            console.log('Placing order with request:', orderRequest);
            console.log('Current user ID:', currentUser.userId);

            // Добавляем заголовок X-User-Id для order-service
            const response = await api.post('/api/orders/place', orderRequest, {
                headers: {
                    'X-User-Id': currentUser.userId
                }
            });

            console.log('Order placed successfully:', response.data);

            // Очищаем корзину после успешного оформления
            await clearCart();

            alert('Order placed successfully! Order ID: ' + response.data.id);
            navigate('/orders');
        } catch (err) {
            console.error('Error placing order:', err);
            console.error('Error response:', err.response?.data);

            if (err.response?.status === 401) {
                setError('Unauthorized. Please login again.');
                navigate('/login');
            } else if (err.response?.status === 400) {
                setError('Bad request: ' + (err.response?.data?.message || 'Invalid order data'));
            } else if (err.response?.status === 404) {
                setError('Service not found. Please check if backend services are running.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to place order');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    if (cartItems.length === 0) {
        return (
            <div>
                <h2>Cart</h2>
                <p>Your cart is empty</p>
                <button onClick={() => navigate('/restaurants')}>Browse Restaurants</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Cart</h2>

            <div style={{ marginBottom: '20px' }}>
                <p>User: {currentUser?.email || 'Not logged in'}</p>
                <p>User ID: {currentUser?.userId || 'N/A'}</p>
                <p>Items in cart: {cartItems.length}</p>
                <p>Restaurant ID: {cartItems[0]?.restaurantId || 'N/A'}</p>
            </div>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <div>
                {cartItems.map(item => (
                    <CartItem key={item.dishId} item={item} />
                ))}
            </div>
            <hr />
            <div>
                <h3>Total: ${(getCartTotal() / 100).toFixed(2)}</h3>
                <button onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                </button>
                <button onClick={handleClearCart} style={{ marginLeft: '10px' }}>
                    Clear Cart
                </button>
            </div>
        </div>
    );
};

export default Cart;