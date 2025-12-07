import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const CartItem = ({ item }) => {
    const { removeFromCart, updateQuantity } = useContext(CartContext);

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity > 0) {
            updateQuantity(item.dishId, newQuantity);
        }
    };

    return (
        <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
            <h4>{item.dishName}</h4>
            <p>{item.dishDescription}</p>
            <p>Price: ${(item.price / 100).toFixed(2)}</p>
            <div>
                <label>Quantity:</label>
                <input
                    type="number"
                    value={item.quantity}
                    onChange={handleQuantityChange}
                    min="1"
                />
            </div>
            <p>Total: ${((item.price * item.quantity) / 100).toFixed(2)}</p>
            <button onClick={() => removeFromCart(item.dishId)}>Remove</button>
        </div>
    );
};

export default CartItem;