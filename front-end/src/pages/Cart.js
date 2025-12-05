import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaCreditCard, FaArrowLeft } from 'react-icons/fa';

// Используем кастомные хуки вместо прямого импорта
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { orderService } from '../services/api';

const Cart = () => {
    const { user } = useAuth();
    const { cartItems, clearCart, getTotalPrice, getItemCount } = useCart();

    const [loading, setLoading] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.error('Для оформления заказа необходимо войти в систему');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Корзина пуста');
            return;
        }

        if (!deliveryAddress.trim()) {
            toast.error('Введите адрес доставки');
            return;
        }

        try {
            setLoading(true);

            // Определяем restaurantId (берем из первого товара)
            const restaurantId = cartItems[0]?.restaurantId;
            if (!restaurantId) {
                throw new Error('Не удалось определить ресторан');
            }

            const orderData = {
                restaurantId,
                items: cartItems.map(item => ({
                    dishId: item.dishId,
                    quantity: item.quantity,
                    price: item.price,
                    dishName: item.dishName,
                    dishDescription: item.dishDescription
                })),
                paymentMethod: paymentMethod.toUpperCase(),
                deliveryAddress
            };

            const response = await orderService.placeOrder(orderData);

            toast.success('Заказ успешно оформлен!');
            clearCart();

            // Здесь можно перенаправить на страницу заказа
            // navigate(`/orders/${response.data.id}`);

        } catch (error) {
            console.error('Error placing order:', error);
            toast.error(error.response?.data?.message || 'Ошибка оформления заказа');
        } finally {
            setLoading(false);
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
            clearCart();
            toast.success('Корзина очищена');
        }
    };

    const totalPrice = getTotalPrice();
    const deliveryFee = totalPrice > 1000 ? 0 : 150;
    const finalTotal = totalPrice + deliveryFee;

    if (cartItems.length === 0) {
        return (
            <div style={styles.emptyCart}>
                <div style={styles.emptyCartIcon}>
                    <FaShoppingCart />
                </div>
                <h2 style={styles.emptyCartTitle}>Ваша корзина пуста</h2>
                <p style={styles.emptyCartText}>
                    Добавьте блюда из ресторанов, чтобы оформить заказ
                </p>
                <Link to="/restaurants" style={styles.continueShoppingBtn}>
                    <FaArrowLeft style={{ marginRight: '10px' }} />
                    Перейти к ресторанам
                </Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FaShoppingCart style={{ marginRight: '10px' }} />
                    Корзина ({getItemCount()} товаров)
                </h1>
                <button onClick={handleClearCart} style={styles.clearCartBtn}>
                    <FaTrash style={{ marginRight: '5px' }} />
                    Очистить корзину
                </button>
            </div>

            <div style={styles.content}>
                {/* Cart Items */}
                <div style={styles.cartItems}>
                    <h2 style={styles.sectionTitle}>Товары в корзине</h2>
                    {cartItems.map(item => (
                        <CartItem key={item.dishId} item={item} />
                    ))}
                </div>

                {/* Order Summary */}
                <div style={styles.orderSummary}>
                    <h2 style={styles.sectionTitle}>Детали заказа</h2>

                    <div style={styles.summaryItem}>
                        <span>Товары ({getItemCount()} шт.)</span>
                        <span>{totalPrice} ₽</span>
                    </div>

                    <div style={styles.summaryItem}>
                        <span>Доставка</span>
                        <span>
              {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
                            {deliveryFee > 0 && totalPrice < 1000 && (
                                <div style={styles.freeDeliveryNote}>
                                    Бесплатная доставка при заказе от 1000 ₽
                                </div>
                            )}
            </span>
                    </div>

                    <div style={styles.divider}></div>

                    <div style={styles.total}>
                        <span>Итого</span>
                        <span style={styles.totalPrice}>{finalTotal} ₽</span>
                    </div>

                    {/* Delivery Address */}
                    <div style={styles.addressSection}>
                        <h3 style={styles.addressTitle}>Адрес доставки</h3>
                        <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Введите адрес доставки"
                            style={styles.addressInput}
                            rows="3"
                        />
                    </div>

                    {/* Payment Method */}
                    <div style={styles.paymentSection}>
                        <h3 style={styles.paymentTitle}>Способ оплаты</h3>
                        <div style={styles.paymentOptions}>
                            <label style={styles.paymentOption}>
                                <input
                                    type="radio"
                                    value="credit_card"
                                    checked={paymentMethod === 'credit_card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <FaCreditCard style={{ margin: '0 10px' }} />
                                Банковская карта
                            </label>

                            <label style={styles.paymentOption}>
                                <input
                                    type="radio"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                Наличными при получении
                            </label>
                        </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading || !user || !deliveryAddress.trim()}
                        style={styles.checkoutButton}
                    >
                        {loading ? (
                            <>
                                <div style={styles.spinner}></div>
                                Оформление...
                            </>
                        ) : (
                            <>
                                Оформить заказ за {finalTotal} ₽
                            </>
                        )}
                    </button>

                    {!user && (
                        <div style={styles.authWarning}>
                            <p>Для оформления заказа необходимо войти в систему</p>
                            <Link to="/login" style={styles.loginLink}>
                                Войти
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
    },
    emptyCart: {
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '500px',
        margin: '0 auto',
    },
    emptyCartIcon: {
        fontSize: '60px',
        color: '#ddd',
        marginBottom: '20px',
    },
    emptyCartTitle: {
        fontSize: '1.8rem',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    emptyCartText: {
        color: '#7f8c8d',
        marginBottom: '30px',
    },
    continueShoppingBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
        color: 'white',
        textDecoration: 'none',
        padding: '12px 25px',
        borderRadius: '6px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
    },
    clearCartBtn: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        padding: '10px 15px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#e74c3c',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#ffeaea',
            borderColor: '#e74c3c',
        },
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px',
        '@media (min-width: 992px)': {
            gridTemplateColumns: '2fr 1fr',
        },
    },
    cartItems: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    orderSummary: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: '20px',
        alignSelf: 'flex-start',
    },
    sectionTitle: {
        fontSize: '1.3rem',
        color: '#2c3e50',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #f8f9fa',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        color: '#7f8c8d',
        fontSize: '0.95rem',
    },
    freeDeliveryNote: {
        fontSize: '0.8rem',
        color: '#ff6b35',
        marginTop: '5px',
    },
    divider: {
        height: '1px',
        backgroundColor: '#e9ecef',
        margin: '20px 0',
    },
    total: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '25px',
    },
    totalPrice: {
        fontSize: '1.5rem',
        color: '#ff6b35',
    },
    addressSection: {
        marginBottom: '25px',
    },
    addressTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    addressInput: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '0.95rem',
        resize: 'vertical',
        transition: 'border-color 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#ff6b35',
        },
    },
    paymentSection: {
        marginBottom: '25px',
    },
    paymentTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    paymentOptions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    paymentOption: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
        },
    },
    checkoutButton: {
        width: '100%',
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        ':hover': {
            backgroundColor: '#e55a2e',
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
        },
        ':disabled': {
            backgroundColor: '#95a5a6',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
        },
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    authWarning: {
        textAlign: 'center',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        marginTop: '20px',
        color: '#856404',
        fontSize: '0.9rem',
    },
    loginLink: {
        color: '#ff6b35',
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '5px',
        ':hover': {
            textDecoration: 'underline',
        },
    },
};

export default Cart;