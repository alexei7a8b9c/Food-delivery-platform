import React from 'react';
import { useCart } from '../context/CartContext';

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="cart-item card">
            <div className="cart-item-content">
                <div className="cart-item-info">
                    <h4>{item.dishName}</h4>
                    <p>{item.dishDescription}</p>
                    <div className="price">${((item.price * item.quantity) / 100).toFixed(2)}</div>
                </div>

                <div className="cart-item-controls">
                    <div className="quantity-controls">
                        <button
                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                            className="btn btn-small"
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                            className="btn btn-small"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={() => removeFromCart(item.dishId)}
                        className="btn btn-danger btn-small"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartItem;