import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            const response = await orderService.getUserOrders()
            setOrders(response.data)
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="text-yellow-500" size={20} />
            case 'CONFIRMED':
            case 'PREPARING':
                return <Package className="text-blue-500" size={20} />
            case 'OUT_FOR_DELIVERY':
                return <Truck className="text-orange-500" size={20} />
            case 'DELIVERED':
                return <CheckCircle className="text-green-500" size={20} />
            case 'CANCELLED':
                return <XCircle className="text-red-500" size={20} />
            default:
                return <Package className="text-gray-500" size={20} />
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои заказы</h1>
                <p className="text-gray-600">История ваших заказов</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Package size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Заказов пока нет</h3>
                    <p className="text-gray-600 mb-6">Сделайте свой первый заказ!</p>
                    <Link
                        to="/restaurants"
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Выбрать ресторан
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                    {getStatusIcon(order.status)}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Заказ #{order.id}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusText(order.status)}
                  </span>
                                    <span className="text-xl font-bold text-orange-500">
                    {order.totalPrice} ₽
                  </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Состав заказа:</h4>
                                        <div className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.dishName} × {item.quantity}</span>
                                                    <span>{item.price * item.quantity} ₽</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="text-orange-500 hover:text-orange-600 transition-colors font-semibold"
                                    >
                                        Подробнее
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Orders