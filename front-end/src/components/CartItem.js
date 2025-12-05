import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const CartItem = ({ item }) => {
    const { removeFromCart, updateQuantity } = useContext(CartContext);

    const handleIncrease = () => {
        updateQuantity(item.dishId, item.quantity + 1);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            updateQuantity(item.dishId, item.quantity - 1);
        }
    };

    const handleRemove = () => {
        removeFromCart(item.dishId);
    };

    const totalPrice = item.price * item.quantity;

    return (
        <div style={styles.cartItem}>
            <div style={styles.itemInfo}>
                <div style={styles.itemImage}>
                    {item.dishName ? item.dishName.charAt(0) : 'D'}
                </div>
                <div style={styles.itemDetails}>
                    <h4 style={styles.itemTitle}>{item.dishName}</h4>
                    <p style={styles.itemDescription}>{item.dishDescription}</p>
                    <div style={styles.itemPrice}>{item.price} ₽ × {item.quantity} = {totalPrice} ₽</div>
                </div>
            </div>

            <div style={styles.itemActions}>
                <div style={styles.quantityControls}>
                    <button
                        onClick={handleDecrease}
                        style={styles.quantityBtn}
                        disabled={item.quantity <= 1}
                    >
                        <FaMinus />
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button onClick={handleIncrease} style={styles.quantityBtn}>
                        <FaPlus />
                    </button>
                </div>
                <button onClick={handleRemove} style={styles.removeBtn}>
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

const styles = {
    cartItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '10px',
        transition: 'all 0.3s ease',
        ':hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
    },
    itemInfo: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    itemImage: {
        width: '50px',
        height: '50px',
        backgroundColor: '#ff6b35',
        color: 'white',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginRight: '15px',
        flexShrink: 0,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '5px',
    },
    itemDescription: {
        fontSize: '0.85rem',
        color: '#7f8c8d',
        marginBottom: '5px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    itemPrice: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#ff6b35',
    },
    itemActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: '2px',
    },
    quantityBtn: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '0.8rem',
        color: '#2c3e50',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#f1f1f1',
            borderColor: '#ff6b35',
        },
        ':disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
            ':hover': {
                backgroundColor: 'white',
                borderColor: '#ddd',
            },
        },
    },
    quantity: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: '30px',
        textAlign: 'center',
    },
    removeBtn: {
        backgroundColor: '#ffeaea',
        border: 'none',
        borderRadius: '6px',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#e74c3c',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#e74c3c',
            color: 'white',
        },
    },
};

export default CartItem;