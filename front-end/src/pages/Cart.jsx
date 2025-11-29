import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'
import { orderService } from '../services/orderService'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

const Cart = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { items, restaurantId, total } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)

    const handleQuantityChange = (dishId, newQuantity) => {
        if (newQuantity === 0) {
            dispatch(removeFromCart(dishId))
        } else {
            dispatch(updateQuantity({ dishId, quantity: newQuantity }))
        }
    }

    const handleRemoveItem = (dishId) => {
        dispatch(removeFromCart(dishId))
    }

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/login')
            return
        }

        try {
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

            const response = await orderService.placeOrder(orderData)
            dispatch(clearCart())

            navigate(`/orders/${response.data.id}`, {
                state: { orderSuccess: true }
            })
        } catch (error) {
            console.error('Error placing order:', error)
            alert('Ошибка при оформлении заказа. Попробуйте еще раз.')
        }
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <ShoppingBag size={64} className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h2>
                    <p className="text-gray-600 mb-6">Добавьте блюда из ресторанов, чтобы сделать заказ</p>
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Выбрать ресторан
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/restaurants')}
                    className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Продолжить выбор
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
                        </div>

                        <div className="divide-y">
                            {items.map(item => (
                                <div key={item.dishId} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {item.dishName}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {item.dishDescription}
                                            </p>
                                            <span className="text-lg font-bold text-orange-500">
                        {item.price} ₽
                      </span>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item.dishId, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.dishId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item.dishId)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-right text-gray-600">
                                        Итого: {item.price * item.quantity} ₽
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Детали заказа</h3>

                        <div className="space-y-3 mb-6">
                            {items.map(item => (
                                <div key={item.dishId} className="flex justify-between text-sm">
                                    <span>{item.dishName} × {item.quantity}</span>
                                    <span>{item.price * item.quantity} ₽</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Итого</span>
                                <span className="text-orange-500">{total} ₽</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors mt-6 font-semibold"
                        >
                            Оформить заказ
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Нажимая кнопку, вы соглашаетесь с условиями обработки данных
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart