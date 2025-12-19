import React, { useState, useEffect } from 'react';
import { orderApi, formatErrorMessage, authApi } from '../../services/api';
import Modal from '../common/Modal';

const ShoppingCart = ({ cart, onRemove, onUpdateQuantity, onClear, totalPrice, restaurantId, restaurantName, user }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Состояние для контактной информации
    const [contactInfo, setContactInfo] = useState({
        email: '',
        fullName: '',
        telephone: '',
        deliveryAddress: 'Доставка по адресу'
    });

    // Загружаем данные пользователя при открытии модального окна
    useEffect(() => {
        if (isCheckoutModalOpen && user && user.token) {
            loadUserData();
        }
    }, [isCheckoutModalOpen, user]);

    const loadUserData = async () => {
        try {
            // Если пользователь авторизован, заполняем его данные
            if (user && user.email) {
                setContactInfo(prev => ({
                    ...prev,
                    email: user.email || '',
                    fullName: user.fullName || '',
                    telephone: user.telephone || ''
                }));

                // Дополнительно пробуем получить данные из user-service через order-service
                if (user.id) {
                    try {
                        const response = await orderApi.getUserDetails(user.id);
                        if (response.data && response.data.fromUserService) {
                            setContactInfo(prev => ({
                                ...prev,
                                email: response.data.email || user.email || '',
                                fullName: response.data.fullName || user.fullName || '',
                                telephone: response.data.telephone || user.telephone || ''
                            }));
                        }
                    } catch (error) {
                        console.log('Could not load user details from service:', error.message);
                        // Используем данные из localStorage
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Корзина пуста');
            return;
        }

        if (!restaurantId) {
            alert('Пожалуйста, выберите ресторан');
            return;
        }

        setIsCheckoutModalOpen(true);
    };

    const handleContactInfoChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateContactInfo = () => {
        if (!contactInfo.email || !contactInfo.email.includes('@')) {
            setCheckoutError('Введите корректный email адрес');
            return false;
        }

        if (!contactInfo.fullName || contactInfo.fullName.trim().length < 2) {
            setCheckoutError('Введите ваше полное имя');
            return false;
        }

        if (!contactInfo.telephone || contactInfo.telephone.trim().length < 5) {
            setCheckoutError('Введите ваш телефон');
            return false;
        }

        return true;
    };

    const confirmOrder = async () => {
        setCheckoutLoading(true);
        setCheckoutError('');

        // Валидация контактных данных
        if (!validateContactInfo()) {
            setCheckoutLoading(false);
            return;
        }

        try {
            // Подготавливаем данные заказа с контактной информацией
            const orderData = {
                restaurantId: restaurantId,
                items: cart.map(item => ({
                    dishId: item.id,
                    dishName: item.name,
                    dishDescription: item.description,
                    quantity: item.quantity,
                    price: Math.round(parseFloat(item.price) * 100)
                })),
                paymentMethod: "CREDIT_CARD",
                deliveryAddress: contactInfo.deliveryAddress,
                customerEmail: contactInfo.email,
                customerFullName: contactInfo.fullName,
                customerTelephone: contactInfo.telephone
            };

            console.log('Sending order data with contact info:', orderData);

            // Отправляем заказ
            const response = await orderApi.createOrder(orderData);

            console.log('Order created with contact info:', response.data);

            // Показываем успех
            setOrderSuccess(true);

            // Через 3 секунды закрываем и очищаем корзину
            setTimeout(() => {
                setIsCheckoutModalOpen(false);
                onClear();
                setOrderSuccess(false);
                // Сбрасываем форму
                setContactInfo({
                    email: user?.email || '',
                    fullName: user?.fullName || '',
                    telephone: user?.telephone || '',
                    deliveryAddress: 'Доставка по адресу'
                });
            }, 3000);

        } catch (error) {
            console.error('Order creation error:', error);
            const errorMessage = formatErrorMessage(error);
            setCheckoutError(`Ошибка при оформлении заказа: ${errorMessage}`);
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="shopping-cart empty">
                <div className="cart-header">
                    <h2 className="section-title">Корзина</h2>
                    <span className="cart-count">0</span>
                </div>
                <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <p>Корзина пуста</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="shopping-cart">
                <div className="cart-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <h2 className="section-title">Корзина</h2>
                    <div className="cart-info">
                        <span className="cart-count">{cart.length}</span>
                        <span className="cart-toggle">{isCollapsed ? '▼' : '▲'}</span>
                    </div>
                </div>

                {!isCollapsed && (
                    <>
                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <p className="cart-item-price">
                                            ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                                            <span className="item-total">
                                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="cart-item-controls">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className="btn-quantity"
                                            >
                                                −
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className="btn-quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="btn-remove"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Итого:</span>
                                <span className="total-price">${totalPrice.toFixed(2)}</span>
                            </div>

                            <div className="cart-actions">
                                <button onClick={onClear} className="btn btn-clear-cart">
                                    Очистить корзину
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    className="btn btn-checkout"
                                    disabled={!restaurantId}
                                >
                                    Оформить заказ
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Модальное окно подтверждения заказа с контактной информацией */}
            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => {
                    if (!checkoutLoading) {
                        setIsCheckoutModalOpen(false);
                        setCheckoutError('');
                        setOrderSuccess(false);
                    }
                }}
                title="Подтверждение заказа"
                size="lg"
            >
                {orderSuccess ? (
                    <div className="order-success">
                        <div className="success-icon">✅</div>
                        <h3>Заказ успешно оформлен!</h3>
                        <p>Номер вашего заказа: <strong>#{Date.now() % 10000}</strong></p>
                        <p>Статус: <span className="status-badge status-pending">PENDING</span></p>
                        <p>Мы свяжемся с вами по телефону: <strong>{contactInfo.telephone}</strong></p>
                        <p>Подтверждение отправлено на: <strong>{contactInfo.email}</strong></p>
                    </div>
                ) : (
                    <div className="checkout-modal">
                        <div className="order-summary">
                            <h4>Детали заказа</h4>
                            <div className="summary-item">
                                <span>Ресторан:</span>
                                <strong>{restaurantName}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Количество блюд:</span>
                                <strong>{cart.length}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Итого:</span>
                                <strong className="total">${totalPrice.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="order-items-preview">
                            <h4>Состав заказа:</h4>
                            {cart.map(item => (
                                <div key={item.id} className="preview-item">
                                    <span className="item-name">{item.name} × {item.quantity}</span>
                                    <span className="item-price">
                                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Форма для контактной информации */}
                        <div className="contact-info-form">
                            <h4>Контактная информация:</h4>

                            {user && user.email ? (
                                <div className="user-info-notice">
                                    <p className="user-logged-in">👤 Вы авторизованы как: <strong>{user.email}</strong></p>
                                    <p className="user-info-hint">Используются ваши данные из профиля. Вы можете их изменить:</p>
                                </div>
                            ) : (
                                <div className="user-info-notice">
                                    <p className="user-not-logged-in">👤 Вы не авторизованы. Заполните данные:</p>
                                </div>
                            )}

                            <div className="contact-form">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactInfo.email}
                                        onChange={handleContactInfoChange}
                                        placeholder="Введите ваш email"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Полное имя *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={contactInfo.fullName}
                                        onChange={handleContactInfoChange}
                                        placeholder="Введите ваше полное имя"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Телефон *</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={contactInfo.telephone}
                                        onChange={handleContactInfoChange}
                                        placeholder="+7 (999) 999-99-99"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Адрес доставки</label>
                                    <textarea
                                        name="deliveryAddress"
                                        value={contactInfo.deliveryAddress}
                                        onChange={handleContactInfoChange}
                                        placeholder="Укажите адрес доставки"
                                        rows="3"
                                        className="form-textarea"
                                    />
                                </div>

                                <div className="form-hint">
                                    <p>* Поля, отмеченные звездочкой, обязательны для заполнения</p>
                                </div>
                            </div>
                        </div>

                        {checkoutError && (
                            <div className="alert alert-error">
                                <strong>Ошибка:</strong> {checkoutError}
                            </div>
                        )}

                        <div className="checkout-actions">
                            <button
                                onClick={confirmOrder}
                                className="btn btn-confirm"
                                disabled={checkoutLoading}
                            >
                                {checkoutLoading ? 'Оформление...' : 'Подтвердить заказ'}
                            </button>
                            <button
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="btn btn-cancel"
                                disabled={checkoutLoading}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .item-total {
                    margin-left: 10px;
                    font-weight: 600;
                    color: #000000;
                }
                
                .order-success {
                    text-align: center;
                    padding: 20px;
                }
                
                .success-icon {
                    font-size: 3rem;
                    margin-bottom: 20px;
                    color: #28a745;
                }
                
                .order-summary {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 2px solid #000000;
                }
                
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .summary-item:last-child {
                    border-bottom: none;
                }
                
                .summary-item .total {
                    font-size: 1.2rem;
                    color: #000000;
                }
                
                .order-items-preview {
                    max-height: 200px;
                    overflow-y: auto;
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                }
                
                .preview-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .preview-item:last-child {
                    border-bottom: none;
                }
                
                .item-name {
                    flex: 1;
                }
                
                .item-price {
                    font-weight: 600;
                    color: #000000;
                }
                
                .checkout-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                }
                
                .btn-confirm {
                    background-color: #000000;
                    color: #ffffff;
                }
                
                .btn-confirm:hover {
                    background-color: #333333;
                }
                
                .btn-confirm:disabled {
                    background-color: #666666;
                    cursor: not-allowed;
                }
                
                .btn-checkout:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .contact-info-form {
                    margin: 20px 0;
                    padding: 20px;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    background-color: #f8f9fa;
                }
                
                .contact-info-form h4 {
                    margin-bottom: 15px;
                    color: #000000;
                }
                
                .user-info-notice {
                    margin-bottom: 20px;
                    padding: 10px 15px;
                    border-radius: 8px;
                    background-color: #e8f4f8;
                    border: 1px solid #bee5eb;
                }
                
                .user-logged-in {
                    color: #0c5460;
                    font-weight: 500;
                    margin-bottom: 5px;
                }
                
                .user-not-logged-in {
                    color: #856404;
                    font-weight: 500;
                }
                
                .user-info-hint {
                    color: #666666;
                    font-size: 0.9rem;
                    margin: 0;
                }
                
                .contact-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                @media (max-width: 768px) {
                    .contact-form {
                        grid-template-columns: 1fr;
                    }
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #000000;
                }
                
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: #ffffff;
                    color: #000000;
                }
                
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #000000;
                }
                
                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                }
                
                .form-hint {
                    grid-column: 1 / -1;
                    margin-top: 10px;
                    font-size: 0.85rem;
                    color: #666666;
                    font-style: italic;
                }
            `}</style>
        </>
    );
};

export default ShoppingCart;