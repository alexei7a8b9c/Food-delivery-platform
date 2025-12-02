import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Изменяем импорт
import '../styles/common.css';

const DishCard = ({ dish, restaurantId, showRestaurantInfo = false }) => {
    const { addToCart } = useCart(); // Используем хук
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        if (!restaurantId) {
            alert('Ошибка: ID ресторана не указан');
            return;
        }

        setIsAdding(true);

        const cartItem = {
            dishId: dish.id,
            quantity: quantity,
            restaurantId: restaurantId,
            dishName: dish.name,
            dishDescription: dish.description || '',
            price: dish.price
        };

        addToCart(cartItem);

        // Анимация добавления
        setTimeout(() => {
            setIsAdding(false);
            setQuantity(1);
        }, 500);
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className={`dish-card ${isAdding ? 'adding' : ''}`}>
            {/* Изображение блюда */}
            <div className="dish-image">
                {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={dish.name} />
                ) : (
                    <div className="image-placeholder">
                        <span>🍽️</span>
                    </div>
                )}
            </div>

            <div className="dish-content">
                {/* Информация о ресторане */}
                {showRestaurantInfo && restaurantId && (
                    <div className="dish-restaurant">
                        <Link to={`/restaurants/${restaurantId}`} className="restaurant-link">
                            Ресторан #{restaurantId}
                        </Link>
                    </div>
                )}

                {/* Название и описание */}
                <h3 className="dish-title">{dish.name}</h3>
                {dish.description && (
                    <p className="dish-description">{dish.description}</p>
                )}

                {/* Цена */}
                <div className="dish-price">
                    <span className="price">{dish.price} ₽</span>
                </div>

                {/* Управление количеством и добавление в корзину */}
                <div className="dish-actions">
                    <div className="quantity-control">
                        <button
                            onClick={decrementQuantity}
                            className="quantity-btn"
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button
                            onClick={incrementQuantity}
                            className="quantity-btn"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={`add-to-cart-btn ${isAdding ? 'loading' : ''}`}
                        disabled={isAdding}
                    >
                        {isAdding ? 'Добавляем...' : 'В корзину'}
                        <span className="cart-icon">🛒</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DishCard;