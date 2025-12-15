import React, { useState } from 'react';

const ShoppingCart = ({ cart, onRemove, onUpdateQuantity, onClear, totalPrice }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                                    <p className="cart-item-price">${parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
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
                            <button className="btn btn-checkout">
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShoppingCart;