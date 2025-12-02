import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice.js'
import { createOrder } from '../store/slices/orderSlice.js'

const Cart = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { items, restaurantId } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.auth)
    const { loading: orderLoading, error: orderError } = useSelector((state) => state.order)

    const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')
    const [paymentMethod, setPaymentMethod] = useState('CARD')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])

    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const deliveryFee = 2.99
    const tax = subtotal * 0.08
    const total = subtotal + deliveryFee + tax

    const handleUpdateQuantity = (dishId, quantity) => {
        dispatch(updateQuantity({ dishId, quantity }))
    }

    const handleRemoveItem = (dishId) => {
        dispatch(removeFromCart(dishId))
    }

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            alert('Please enter delivery address')
            return
        }

        const orderData = {
            restaurantId,
            items: items.map(item => ({
                dishId: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            })),
            deliveryAddress,
            paymentMethod,
            notes,
            totalAmount: total
        }

        const result = await dispatch(createOrder(orderData))
        if (result.type === 'order/create/fulfilled') {
            dispatch(clearCart())
            navigate(`/orders/${result.payload.id}`)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some delicious food from our restaurants!</p>
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
                    >
                        Browse Restaurants
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

                {orderError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {orderError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Order Items</h2>

                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center border-b pb-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                            <span className="text-3xl">🍽️</span>
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <h3 className="font-bold">{item.name}</h3>
                                            <p className="text-gray-600 text-sm">{item.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>

                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t">
                                <button
                                    onClick={() => dispatch(clearCart())}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Order Details Form */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">Order Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Delivery Address</label>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`px-4 py-3 border rounded text-center ${
                                                paymentMethod === 'CARD' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                            }`}
                                        >
                                            💳 Credit Card
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CASH')}
                                            className={`px-4 py-3 border rounded text-center ${
                                                paymentMethod === 'CASH' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                            }`}
                                        >
                                            💵 Cash on Delivery
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Special Instructions</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Any special requests or delivery instructions..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                                className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {orderLoading ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <p className="text-gray-500 text-sm mt-4 text-center">
                                By placing your order, you agree to our Terms & Conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart