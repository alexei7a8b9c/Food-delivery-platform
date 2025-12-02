import React from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';

function DishCard({ dish }) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            dishId: dish.id,
            restaurantId: dish.restaurantId,
            dishName: dish.name,
            dishDescription: dish.description,
            price: dish.price,
            quantity: 1
        });

        toast.success(`${dish.name} added to cart!`, {
            icon: '🛒',
        });
    };

    const formatPrice = (price) => {
        return `$${(price / 100).toFixed(2)}`;
    };

    return (
        <div className="dish-card card">
            <div className="dish-image">
                {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={dish.name} className="dish-img" />
                ) : (
                    <div className="dish-placeholder">
                        <span className="dish-emoji">🍽️</span>
                    </div>
                )}
            </div>

            <div className="dish-info">
                <h4 className="dish-name">{dish.name}</h4>

                {dish.description && (
                    <p className="dish-description">{dish.description}</p>
                )}

                <div className="dish-footer">
                    <div className="dish-price">{formatPrice(dish.price)}</div>

                    <button
                        onClick={handleAddToCart}
                        className="btn btn-success add-to-cart-btn"
                    >
                        <FaShoppingCart /> Add
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DishCard;