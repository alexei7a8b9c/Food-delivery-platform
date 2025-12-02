import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserOrders, clearError } from '../store/slices/orderSlice.js'
import { ORDER_STATUS } from '../utils/constants.js'

const Orders = () => {
    const dispatch = useDispatch()
    const { orders, loading, error } = useSelector((state) => state.order)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(getUserOrders())
    }, [dispatch])

    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING: return 'bg-yellow-100 text-yellow-800'
            case ORDER_STATUS.CONFIRMED: return 'bg-blue-100 text-blue-800'
            case ORDER_STATUS.PREPARING: return 'bg-purple-100 text-purple-800'
            case ORDER_STATUS.READY: return 'bg-indigo-100 text-indigo-800'
            case ORDER_STATUS.DELIVERING: return 'bg-orange-100 text-orange-800'
            case ORDER_STATUS.DELIVERED: return 'bg-green-100 text-green-800'
            case ORDER_STATUS.CANCELLED: return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
                <button
                    onClick={() => dispatch(clearError())}
                    className="ml-4 text-red-700 hover:text-red-900"
                >
                    Dismiss
                </button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Orders</h1>
                <div className="text-gray-600">
                    Hello, <span className="font-semibold">{user?.name}</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
                    <p className="text-gray-600 mb-8">When you place orders, they will appear here</p>
                    <Link
                        to="/restaurants"
                        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
                    >
                        Order Now
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                        <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                                    </div>

                                    <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Restaurant</h4>
                                        <p>{order.restaurantName}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Delivery Address</h4>
                                        <p className="truncate">{order.deliveryAddress}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Total Amount</h4>
                                        <p className="text-green-600 font-bold">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between">
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div>
                                        <span className="text-gray-600 mr-4">Payment: {order.paymentMethod}</span>
                                        {order.estimatedDelivery && (
                                            <span className="text-gray-600">
                        Estimated: {formatDate(order.estimatedDelivery)}
                      </span>
                                        )}
                                    </div>

                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="text-green-500 hover:text-green-700 font-semibold"
                                    >
                                        View Details →
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