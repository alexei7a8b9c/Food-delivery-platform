import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const DishCard = ({ dish, showAddButton = true, restaurantId = null }) => {
    const { addToCart } = useContext(CartContext);
    const { currentUser } = useContext(AuthContext);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!currentUser) {
            if (window.confirm('You need to login to add items to cart. Go to login page?')) {
                navigate('/login');
            }
            return;
        }

        // Определяем restaurantId
        const finalRestaurantId = restaurantId || dish.restaurantId;

        if (!finalRestaurantId) {
            setMessage('Error: Cannot determine restaurant.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const cartItem = {
                dishId: dish.id,
                dishName: dish.name || 'Unknown Dish',
                dishDescription: dish.description || '',
                price: dish.price || 0,
                quantity: parseInt(quantity) || 1,
                restaurantId: finalRestaurantId
            };

            console.log('Adding to cart for user:', currentUser.userId);
            await addToCart(cartItem);
            setMessage(`Added ${quantity} ${dish.name} to cart`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to add to cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            border: '1px solid black',
            margin: '10px',
            padding: '10px',
            backgroundColor: 'white'
        }}>
            <h4>{dish.name}</h4>
            <p>{dish.description}</p>
            <p><strong>Price:</strong> ${dish.price ? (dish.price / 100).toFixed(2) : '0.00'}</p>

            {currentUser && (
                <div style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>
                    User: {currentUser.email} (ID: {currentUser.userId})
                </div>
            )}

            {showAddButton && (
                <div>
                    <div>
                        <label>Quantity: </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={quantity}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 1 && value <= 10) {
                                    setQuantity(value);
                                }
                            }}
                            style={{ width: '60px' }}
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={loading}
                        style={{
                            marginTop: '5px',
                            padding: '8px 16px'
                        }}
                    >
                        {loading ? 'Adding...' : 'Add to Cart'}
                    </button>

                    {message && (
                        <div style={{
                            border: message.includes('Error') || message.includes('Failed') ? '1px solid red' : '1px solid green',
                            backgroundColor: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e9',
                            padding: '10px',
                            marginTop: '10px',
                            fontSize: '14px'
                        }}>
                            <strong>{message.includes('Error') || message.includes('Failed') ? 'Error:' : 'Success:'}</strong> {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DishCard;