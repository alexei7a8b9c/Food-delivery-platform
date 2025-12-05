import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const DishCard = ({ dish, showAddButton = true }) => {
    const { addToCart, updateQuantity, cartItems } = useContext(CartContext);

    const cartItem = cartItems.find(item => item.dishId === dish.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        const cartItem = {
            dishId: dish.id,
            dishName: dish.name,
            dishDescription: dish.description,
            price: dish.price,
            quantity: 1,
            restaurantId: dish.restaurantId,
        };

        addToCart(cartItem);
        toast.success(`${dish.name} добавлено в корзину!`);
    };

    const handleIncrease = () => {
        updateQuantity(dish.id, quantityInCart + 1);
    };

    const handleDecrease = () => {
        if (quantityInCart > 1) {
            updateQuantity(dish.id, quantityInCart - 1);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    return (
        <div style={styles.card}>
            <div style={styles.imageContainer}>
                {dish.imageUrl ? (
                    <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        style={styles.image}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; color: #adb5bd;"><span>No Image</span></div>';
                        }}
                    />
                ) : (
                    <div style={styles.imagePlaceholder}>
                        <span>No Image</span>
                    </div>
                )}
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{dish.name}</h3>
                    <div style={styles.price}>{formatPrice(dish.price)} ₽</div>
                </div>

                <p style={styles.description}>{dish.description || 'Описание отсутствует'}</p>

                {showAddButton && (
                    <div style={styles.actions}>
                        {quantityInCart > 0 ? (
                            <div style={styles.quantityControls}>
                                <button
                                    onClick={handleDecrease}
                                    style={styles.quantityBtn}
                                    disabled={quantityInCart <= 1}
                                >
                                    <FaMinus />
                                </button>
                                <span style={styles.quantity}>{quantityInCart}</span>
                                <button
                                    onClick={handleIncrease}
                                    style={styles.quantityBtn}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleAddToCart} style={styles.addButton}>
                                <FaShoppingCart style={{ marginRight: '5px' }} />
                                В корзину
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ':hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
    },
    imageContainer: {
        height: '160px',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'scale(1.05)',
        },
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#adb5bd',
        fontSize: '0.9rem',
    },
    content: {
        padding: '15px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#2c3e50',
        margin: 0,
        flex: 1,
    },
    price: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#ff6b35',
        marginLeft: '10px',
        whiteSpace: 'nowrap',
    },
    description: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        lineHeight: 1.4,
        marginBottom: '15px',
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    actions: {
        marginTop: 'auto',
    },
    addButton: {
        width: '100%',
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: '5px',
    },
    quantityBtn: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        width: '30px',
        height: '30px',
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
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: '30px',
        textAlign: 'center',
    },
};

export default DishCard;