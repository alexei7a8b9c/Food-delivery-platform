import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import api from '../services/api';
import '../styles/common.css';

const Cart = () => {
    const { user } = useAuth();
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [restaurantName, setRestaurantName] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // Вычисляем общую стоимость
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalPrice(total);

        // Если есть товары в корзине, получаем название ресторана
        if (cartItems.length > 0) {
            // В реальном приложении здесь нужно получать название ресторана по ID
            // Для демо просто показываем ID
            setRestaurantName(`Ресторан #${cartItems[0].restaurantId}`);
        } else {
            setRestaurantName('');
        }
    }, [cartItems]);

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert('Корзина пуста');
            return;
        }

        if (!user) {
            alert('Пожалуйста, войдите в систему для оформления заказа');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            setOrderError(null);

            // Собираем данные для заказа
            const orderData = {
                restaurantId: cartItems[0].restaurantId,
                items: cartItems.map(item => ({
                    dishId: item.dishId,
                    quantity: item.quantity,
                    price: item.price,
                    dishName: item.dishName,
                    dishDescription: item.dishDescription || ''
                })),
                paymentMethod: 'CREDIT_CARD' // Можно добавить выбор метода оплаты
            };

            console.log('Placing order:', orderData);

            // Отправляем запрос на создание заказа
            const response = await api.post('/api/orders/place', orderData);

            console.log('Order placed successfully:', response.data);

            // Очищаем корзину
            clearCart();
            setOrderPlaced(true);

            // Перенаправляем на страницу заказов через 2 секунды
            setTimeout(() => {
                navigate('/orders');
            }, 2000);

        } catch (error) {
            console.error('Failed to place order:', error);
            setOrderError(
                error.response?.data?.message ||
                'Не удалось оформить заказ. Пожалуйста, попробуйте снова.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleContinueShopping = () => {
        navigate('/restaurants');
    };

    if (orderPlaced) {
        return (
            <div className="container">
                <div className="order-success">
                    <div className="success-icon">✅</div>
                    <h2>Заказ успешно оформлен!</h2>
                    <p>Спасибо за ваш заказ. Вы будете перенаправлены на страницу заказов...</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="btn btn-primary"
                    >
                        Перейти к заказам
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="cart-header">
                <h1>Корзина</h1>
                {restaurantName && (
                    <p className="restaurant-info">Ресторан: {restaurantName}</p>
                )}
            </div>

            {orderError && (
                <div className="error-message">
                    <p>{orderError}</p>
                    <button
                        onClick={() => setOrderError(null)}
                        className="btn btn-outline btn-small"
                    >
                        Закрыть
                    </button>
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <h2>Ваша корзина пуста</h2>
                    <p>Добавьте товары из меню ресторанов</p>
                    <button
                        onClick={handleContinueShopping}
                        className="btn btn-primary"
                    >
                        Перейти к ресторанам
                    </button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map((item, index) => (
                            <CartItem
                                key={`${item.dishId}-${index}`}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-header">
                            <h3>Итог заказа</h3>
                        </div>

                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Количество товаров:</span>
                                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Общая стоимость:</span>
                                <span className="total-price">{totalPrice} ₽</span>
                            </div>

                            <div className="summary-row delivery">
                                <span>Доставка:</span>
                                <span>Бесплатно</span>
                            </div>

                            <div className="summary-row total">
                                <span>К оплате:</span>
                                <span className="final-price">{totalPrice} ₽</span>
                            </div>
                        </div>

                        <div className="summary-actions">
                            <button
                                onClick={handlePlaceOrder}
                                className="btn btn-primary btn-large"
                                disabled={loading}
                            >
                                {loading ? 'Оформление...' : 'Оформить заказ'}
                            </button>

                            <button
                                onClick={clearCart}
                                className="btn btn-outline"
                                disabled={loading}
                            >
                                Очистить корзину
                            </button>
                        </div>

                        <div className="payment-methods">
                            <h4>Способы оплаты:</h4>
                            <div className="payment-icons">
                                <span className="payment-icon">💳</span>
                                <span className="payment-icon">💰</span>
                                <span className="payment-icon">📱</span>
                            </div>
                            <p className="payment-note">Оплата при получении</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;