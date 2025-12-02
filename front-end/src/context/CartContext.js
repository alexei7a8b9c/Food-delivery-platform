import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.dishId === item.dishId);

            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.dishId === item.dishId
                        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                        : cartItem
                );
            }

            return [...prevCart, item];
        });
    };

    const removeFromCart = (dishId) => {
        setCart(prevCart => prevCart.filter(item => item.dishId !== dishId));
    };

    const updateQuantity = (dishId, quantity) => {
        if (quantity < 1) {
            removeFromCart(dishId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.dishId === dishId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};