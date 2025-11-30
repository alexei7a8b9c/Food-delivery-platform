import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../store/slices/cartSlice'
import { placeOrder } from '../store/slices/orderSlice'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

const Cart = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { items, isLoading } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user) {
            dispatch(fetchCart())
        }
    }, [dispatch, user])

    const handleQuantityChange = (dishId, newQuantity) => {
        if (newQuantity === 0) {
            dispatch(removeFromCart(dishId))
        } else {
            dispatch(updateCartItem({ dishId, quantity: newQuantity }))
        }
    }

    const handleRemoveItem = (dishId) => {
        dispatch(removeFromCart(dishId))
    }

    const handleClearCart = () => {
        dispatch(clearCart())
    }

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        if (items.length === 0) return

        const restaurantId = items[0]?.restaurantId
        const orderData = {
            restaurantId: restaurantId,
            items: items.map(item => ({
                dishId: item.dishId,
                quantity: item.quantity,
                price: item.price,
                dishName: item.dishName,
                dishDescription: item.dishDescription
            })),
            paymentMethod: 'CREDIT_CARD'
        }

        try {
            await dispatch(placeOrder(orderData)).unwrap()
            dispatch(clearCart())
            navigate('/orders')
        } catch (error) {
            console.error('Failed to place order:', error)
        }
    }

    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const totalItems = items.reduce((total, item) => total + item.quantity, 0)

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to view your cart</p>
                    <button onClick={() => navigate('/login')} className="btn-primary">
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    {items.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-700 flex items-center space-x-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Clear Cart</span>
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-4">Add some delicious food from our restaurants</p>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="btn-primary"
                        >
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Cart Items */}
                        <div className="divide-y">
                            {items.map(item => (
                                <div key={item.dishId} className="p-6 flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {item.dishName}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {item.dishDescription}
                                        </p>
                                        <p className="text-lg font-semibold text-primary-600">
                                            ${(item.price / 100).toFixed(2)} each
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.dishId, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>

                                            <span className="w-8 text-center font-medium text-lg">
                        {item.quantity}
                      </span>

                                            <button
                                                onClick={() => handleQuantityChange(item.dishId, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="text-right min-w-24">
                                            <p className="text-lg font-semibold text-gray-900">
                                                ${((item.price * item.quantity) / 100).toFixed(2)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.dishId)}
                                            className="text-red-600 hover:text-red-700 p-2"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Total Items:</span>
                                <span className="font-semibold">{totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total Price:</span>
                                <span className="text-primary-600">
                  ${(totalPrice / 100).toFixed(2)}
                </span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isLoading}
                                className="w-full btn-primary mt-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cart