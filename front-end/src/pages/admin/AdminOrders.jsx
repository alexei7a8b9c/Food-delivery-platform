import React, { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import { Search, Filter, Eye, RefreshCw, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updatingStatus, setUpdatingStatus] = useState(null)

    const statusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'PENDING', label: 'Ожидает' },
        { value: 'CONFIRMED', label: 'Подтвержден' },
        { value: 'PREPARING', label: 'Готовится' },
        { value: 'OUT_FOR_DELIVERY', label: 'В пути' },
        { value: 'DELIVERED', label: 'Доставлен' },
        { value: 'CANCELLED', label: 'Отменен' }
    ]

    const statusSequence = [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED'
    ]

    useEffect(() => {
        loadOrders()
    }, [])

    useEffect(() => {
        filterOrders()
    }, [searchTerm, statusFilter, orders])

    const loadOrders = async () => {
        try {
            const response = await orderService.getAllOrders()
            setOrders(response.data)
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        let filtered = orders

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.userId.toString().includes(searchTerm) ||
                order.restaurantId.toString().includes(searchTerm)
            )
        }

        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        setFilteredOrders(filtered)
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingStatus(orderId)
        try {
            await orderService.updateOrderStatus(orderId, newStatus)
            await loadOrders() // Reload to get updated data
        } catch (error) {
            console.error('Error updating order status:', error)
            alert('Ошибка при обновлении статуса заказа')
        } finally {
            setUpdatingStatus(null)
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

    const getNextStatus = (currentStatus) => {
        const currentIndex = statusSequence.indexOf(currentStatus)
        if (currentIndex === -1 || currentIndex === statusSequence.length - 1) {
            return null
        }
        return statusSequence[currentIndex + 1]
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление заказами</h1>
                    <p className="text-gray-600">Просмотр и обновление статусов заказов</p>
                </div>

                <button
                    onClick={loadOrders}
                    className="mt-4 md:mt-0 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                >
                    <RefreshCw size={20} className="mr-2" />
                    Обновить
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по ID заказа, пользователя или ресторана..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Заказ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Пользователь
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ресторан
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Сумма
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Дата
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getStatusIcon(order.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">ID: {order.userId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">ID: {order.restaurantId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-orange-500">
                                        {order.totalPrice} ₽
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-100 text-blue-800'
                    }`}>
                      {getStatusText(order.status)}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.orderDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="Просмотреть детали"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => {
                                                    const nextStatus = getNextStatus(order.status)
                                                    if (nextStatus) {
                                                        updateOrderStatus(order.id, nextStatus)
                                                    }
                                                }}
                                                disabled={updatingStatus === order.id || !getNextStatus(order.status)}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                    updatingStatus === order.id || !getNextStatus(order.status)
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                                }`}
                                            >
                                                {updatingStatus === order.id ? '...' : 'Далее'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Package size={64} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Заказы не найдены</h3>
                        <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Детали заказа #{selectedOrder.id}</h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Информация о заказе</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Статус:</span>
                                            <span className="font-medium">{getStatusText(selectedOrder.status)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Дата заказа:</span>
                                            <span className="font-medium">{formatDate(selectedOrder.orderDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ID пользователя:</span>
                                            <span className="font-medium">{selectedOrder.userId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">ID ресторана:</span>
                                            <span className="font-medium">{selectedOrder.restaurantId}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Стоимость</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Общая сумма:</span>
                                            <span className="font-semibold text-orange-500 text-lg">
                        {selectedOrder.totalPrice} ₽
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Состав заказа</h4>
                                <div className="border rounded-lg">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{item.dishName}</h5>
                                                <p className="text-sm text-gray-600">{item.dishDescription}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">
                                                    {item.quantity} × {item.price} ₽
                                                </div>
                                                <div className="font-semibold text-orange-500">
                                                    {item.quantity * item.price} ₽
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status Actions */}
                            {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Обновить статус</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {statusSequence.map((status, index) => {
                                            if (index <= statusSequence.indexOf(selectedOrder.status)) return null

                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                                    disabled={updatingStatus === selectedOrder.id}
                                                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    {updatingStatus === selectedOrder.id ? '...' : getStatusText(status)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrders