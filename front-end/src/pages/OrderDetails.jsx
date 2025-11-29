import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { Package, Clock, CheckCircle, XCircle, Truck, ArrowLeft } from 'lucide-react'

const OrderDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrder()
    }, [id])

    const loadOrder = async () => {
        try {
            const response = await orderService.getOrderById(id)
            setOrder(response.data)
        } catch (error) {
            console.error('Error loading order:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="text-yellow-500" size={24} />
            case 'CONFIRMED':
            case 'PREPARING':
                return <Package className="text-blue-500" size={24} />
            case 'OUT_FOR_DELIVERY':
                return <Truck className="text-orange-500" size={24} />
            case 'DELIVERED':
                return <CheckCircle className="text-green-500" size={24} />
            case 'CANCELLED':
                return <XCircle className="text-red-500" size={24} />
            default:
                return <Package className="text-gray-500" size={24} />
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': 'Ожидает подтверждения',
            'CONFIRMED': 'Подтвержден',
            'PREPARING': 'Готовится',
            'OUT_FOR_DELIVERY': 'В пути',
            'DELIVERED': 'Доставлен',
            'CANCELLED': 'Отменен'
        }
        return statusMap[status] || status
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Заказ не найден</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Вернуться к заказам
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Назад к заказам
                </button>
            </div>

            {location.state?.orderSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <CheckCircle className="text-green-500 mr-2" size={20} />
                        <span className="text-green-700 font-semibold">Заказ успешно создан!</span>
                    </div>
                    <p className="text-green-600 mt-1">Номер вашего заказа: #{order.id}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            {getStatusIcon(order.status)}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Заказ #{order.id}
                                </h1>
                                <p className="text-gray-600">
                                    {formatDate(order.orderDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
              <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
              }`}>
                {getStatusText(order.status)}
              </span>
                            <span className="text-2xl font-bold text-orange-500">
                {order.totalPrice} ₽
              </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Состав заказа</h3>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.dishName}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{item.dishDescription}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-600">{item.quantity} × {item.price} ₽</span>
                                                <span className="font-semibold text-orange-500">
                          {item.quantity * item.price} ₽
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о заказе</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Статус доставки</h4>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(order.status)}
                                        <span className="text-gray-700">{getStatusText(order.status)}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Детали</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ID заказа:</span>
                                            <span className="font-medium">#{order.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Дата заказа:</span>
                                            <span className="font-medium">{formatDate(order.orderDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ID ресторана:</span>
                                            <span className="font-medium">{order.restaurantId}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Итоговая сумма</h4>
                                    <div className="text-2xl font-bold text-orange-500 text-center">
                                        {order.totalPrice} ₽
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails