import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Инициализируем cartItems из localStorage или пустым массивом
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Сохраняем корзину в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            // Проверяем, есть ли уже такое блюдо в корзине
            const existingItemIndex = prevItems.findIndex(
                i => i.dishId === item.dishId && i.restaurantId === item.restaurantId
            );

            if (existingItemIndex >= 0) {
                // Обновляем количество существующего товара
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += item.quantity;
                return updatedItems;
            } else {
                // Добавляем новый товар
                return [...prevItems, item];
            }
        });
    };

    const updateQuantity = (index, quantity) => {
        if (quantity < 1) return;

        setCartItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index].quantity = quantity;
            return updatedItems;
        });
    };

    const removeFromCart = (index) => {
        setCartItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems.splice(index, 1);
            return updatedItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems: cartItems || [], // Гарантируем, что это всегда массив
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};