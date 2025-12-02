import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderById, clearCurrentOrder, clearError } from '../store/slices/orderSlice.js'
import { ORDER_STATUS } from '../utils/constants.js'

const OrderDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentOrder, loading, error } = useSelector((state) => state.order)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (id) {
            dispatch(getOrderById(id))
        }

        return () => {
            dispatch(clearCurrentOrder())
        }
    }, [id, dispatch])

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
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusProgress = (status) => {
        const steps = [
            ORDER_STATUS.PENDING,
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PREPARING,
            ORDER_STATUS.READY,
            ORDER_STATUS.DELIVERING,
            ORDER_STATUS.DELIVERED
        ]

        const currentIndex = steps.indexOf(status)
        return ((currentIndex + 1) / steps.length) * 100
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
                    onClick={() => {
                        dispatch(clearError())
                        navigate('/orders')
                    }}
                    className="ml-4 text-red-700 hover:text-red-900"
                >
                    Back to Orders
                </button>
            </div>
        )
    }

    if (!currentOrder) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Order not found</p>
                <button
                    onClick={() => navigate('/orders')}
                    className="mt-4 text-green-500 hover:underline"
                >
                    Back to Orders
                </button>
            </div>
        )
    }

    const isAdmin = user?.roles?.includes('ADMIN')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/orders')}
                    className="text-green-500 hover:text-green-700 mb-4"
                >
                    ← Back to Orders
                </button>
                <h1 className="text-3xl font-bold">Order Details</h1>
            </div>

            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Order #{currentOrder.id}</h2>
                        <p className="text-gray-600">Placed on {formatDate(currentOrder.createdAt)}</p>
                    </div>

                    <div className="mt-4 md:mt-0">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(currentOrder.status)}`}>
              {currentOrder.status}
            </span>
                    </div>
                </div>

                {/* Progress Bar */}
                {currentOrder.status !== ORDER_STATUS.CANCELLED && (
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Order Placed</span>
                            <span>Confirmed</span>
                            <span>Preparing</span>
                            <span>Ready</span>
                            <span>On the Way</span>
                            <span>Delivered</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${getStatusProgress(currentOrder.status)}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Restaurant Information</h3>
                        <p className="font-bold">{currentOrder.restaurantName}</p>
                        <p className="text-gray-600">{currentOrder.restaurantAddress}</p>
                        <p className="text-gray-600">Phone: {currentOrder.restaurantPhone}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Delivery Information</h3>
                        <p className="font-bold">{user?.name}</p>
                        <p className="text-gray-600">{currentOrder.deliveryAddress}</p>
                        <p className="text-gray-600">Phone: {user?.phoneNumber}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>

                <div className="space-y-4">
                    {currentOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                                <div>
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">${(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-semibold">{currentOrder.paymentMethod}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status</span>
                            <span className={`px-2 py-1 rounded text-sm ${
                                currentOrder.paymentStatus === 'PAID'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                {currentOrder.paymentStatus}
              </span>
                        </div>

                        {currentOrder.paymentId && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment ID</span>
                                <span className="font-mono text-sm">{currentOrder.paymentId}</span>
                            </div>
                        )}

                        {currentOrder.paidAt && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Paid At</span>
                                <span>{formatDate(currentOrder.paidAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${currentOrder.subtotal?.toFixed(2) || currentOrder.totalAmount.toFixed(2)}</span>
                        </div>

                        {currentOrder.deliveryFee !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span>${currentOrder.deliveryFee.toFixed(2)}</span>
                            </div>
                        )}

                        {currentOrder.taxAmount !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span>${currentOrder.taxAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="border-t pt-3 flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span className="text-green-600">${currentOrder.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {currentOrder.notes && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold text-gray-700 mb-2">Special Instructions</h3>
                            <p className="text-gray-600">{currentOrder.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                    <h2 className="text-xl font-bold mb-4">Admin Actions</h2>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => alert('Update status functionality to be implemented')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Update Status
                        </button>
                        <button
                            onClick={() => alert('Assign driver functionality to be implemented')}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Assign Driver
                        </button>
                        <button
                            onClick={() => alert('Refund functionality to be implemented')}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Process Refund
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderDetails