import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById, cancelOrder } from '../store/slices/orderSlice'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils/constants'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

const OrderDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentOrder, isLoading } = useSelector((state) => state.orders)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user && id) {
            dispatch(fetchOrderById(id))
        }
    }, [dispatch, id, user])

    const handleCancelOrder = async () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await dispatch(cancelOrder(id)).unwrap()
            } catch (error) {
                console.error('Failed to cancel order:', error)
            }
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED':
                return <CheckCircle className="h-6 w-6 text-green-500" />
            case 'CANCELLED':
                return <XCircle className="h-6 w-6 text-red-500" />
            case 'OUT_FOR_DELIVERY':
                return <Truck className="h-6 w-6 text-purple-500" />
            default:
                return <Clock className="h-6 w-6 text-yellow-500" />
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const canCancel = currentOrder?.status === 'PENDING' || currentOrder?.status === 'CONFIRMED'

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
                    <p className="text-gray-600 mb-4">You need to be logged in to view order details</p>
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

    if (!currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
                    <button onClick={() => navigate('/orders')} className="btn-primary">
                        Back to Orders
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </button>

                    {canCancel && (
                        <button
                            onClick={handleCancelOrder}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Order #{currentOrder.id}</h1>
                                <p className="text-primary-100">
                                    Placed on {formatDate(currentOrder.orderDate)}
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center justify-end space-x-2 mb-2">
                                    {getStatusIcon(currentOrder.status)}
                                    <span className="text-lg font-semibold">
                    {ORDER_STATUS_LABELS[currentOrder.status]}
                  </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    ${(currentOrder.totalPrice / 100).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {currentOrder.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.dishName}</h3>
                                        <p className="text-gray-600 text-sm">{item.dishDescription}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {item.quantity} x ${(item.price / 100).toFixed(2)}
                                        </p>
                                        <p className="text-gray-600">
                                            ${((item.price * item.quantity) / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                  ${(currentOrder.totalPrice / 100).toFixed(2)}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-medium">$2.99</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">
                  ${((currentOrder.totalPrice * 0.08) / 100).toFixed(2)}
                </span>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary-600">
                  ${((currentOrder.totalPrice * 1.08 + 299) / 100).toFixed(2)}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="p-6 border-t">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
                        <div className="space-y-3">
                            {Object.keys(ORDER_STATUS_LABELS).map((status, index) => (
                                <div key={status} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${
                                        currentOrder.status === status
                                            ? 'bg-primary-500'
                                            : index <= Object.keys(ORDER_STATUS_LABELS).indexOf(currentOrder.status)
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                    }`} />
                                    <span className={`${
                                        currentOrder.status === status
                                            ? 'text-primary-600 font-semibold'
                                            : index <= Object.keys(ORDER_STATUS_LABELS).indexOf(currentOrder.status)
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                    }`}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails