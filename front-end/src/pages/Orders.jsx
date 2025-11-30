import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserOrders } from '../store/slices/orderSlice'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils/constants'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'

const Orders = () => {
    const dispatch = useDispatch()
    const { orders, isLoading } = useSelector((state) => state.orders)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user) {
            dispatch(fetchUserOrders())
        }
    }, [dispatch, user])

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <Clock className="h-5 w-5 text-yellow-500" />
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to view your orders</p>
                    <Link to="/login" className="btn-primary">
                        Sign In
                    </Link>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track your food delivery orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-4">Start by ordering some delicious food</p>
                        <Link to="/restaurants" className="btn-primary">
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Order #{order.id}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(order.status)}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-900 font-semibold">
                                        Total: ${(order.totalPrice / 100).toFixed(2)}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {order.items?.length || 0} items
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {order.items?.map((item, index) => (
                                                    <li key={index}>
                                                        {item.quantity}x {item.dishName} - ${((item.price * item.quantity) / 100).toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="btn-secondary text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders