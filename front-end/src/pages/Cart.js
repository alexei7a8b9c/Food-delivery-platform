import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { FaShoppingCart, FaTrash, FaCreditCard } from 'react-icons/fa';

function Cart() {
    const { cart, clearCart, totalPrice } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/orders');
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="text-center mt-20">
                    <FaShoppingCart size={100} color="#ccc" />
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious food from our restaurants!</p>
                    <Link to="/restaurants" className="btn btn-primary mt-20">
                        Browse Restaurants
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>

            <div className="cart-items mt-20">
                {cart.map(item => (
                    <CartItem key={item.dishId} item={item} />
                ))}
            </div>

            <div className="cart-summary card mt-20">
                <h3>Order Summary</h3>

                <div className="summary-details">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>${(totalPrice / 100).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery Fee:</span>
                        <span>$2.99</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total:</span>
                        <span>${((totalPrice / 100) + 2.99).toFixed(2)}</span>
                    </div>
                </div>

                <div className="cart-actions mt-20">
                    <button onClick={clearCart} className="btn btn-secondary">
                        <FaTrash /> Clear Cart
                    </button>

                    <button onClick={handleCheckout} className="btn btn-success">
                        <FaCreditCard /> Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cart;