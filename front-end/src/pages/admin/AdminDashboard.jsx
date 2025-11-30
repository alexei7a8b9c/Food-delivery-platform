import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, fetchOrderStatistics } from '../store/slices/orderSlice'
import { fetchRestaurants } from '../store/slices/restaurantSlice'
import { Package, Utensils, Users, DollarSign } from 'lucide-react'

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const { orders, statistics } = useSelector((state) => state.orders)
    const { restaurants } = useSelector((state) => state.restaurants)

    useEffect(() => {
        dispatch(fetchAllOrders())
        dispatch(fetchRestaurants())
        // Note: You'll need to add fetchOrderStatistics to your orderService and orderSlice
    }, [dispatch])

    const recentOrders = orders.slice(0, 5)
    const totalRevenue = orders
        .filter(order => order.status === 'DELIVERED')
        .reduce((total, order) => total + order.totalPrice, 0)

    const stats = [
        {
            title: 'Total Orders',
            value: statistics?.totalOrders || orders.length,
            icon: Package,
            color: 'bg-blue-500'
        },
        {
            title: 'Pending Orders',
            value: statistics?.pendingOrders || orders.filter(o => o.status === 'PENDING').length,
            icon: Package,
            color: 'bg-yellow-500'
        },
        {
            title: 'Total Restaurants',
            value: restaurants.length,
            icon: Utensils,
            color: 'bg-green-500'
        },
        {
            title: 'Total Revenue',
            value: `$${(totalRevenue / 100).toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-purple-500'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your food delivery platform</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                            <Link to="/admin/orders" className="text-primary-600 hover:text-primary-500 text-sm">
                                View all
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                                        <p className="text-sm text-gray-600">
                                            ${(order.totalPrice / 100).toFixed(2)} • {order.status}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                                </div>
                            ))}

                            {recentOrders.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No orders yet</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

                        <div className="space-y-3">
                            <Link
                                to="/admin/orders"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Package className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">Manage Orders</p>
                                    <p className="text-sm text-gray-600">View and update order status</p>
                                </div>
                            </Link>

                            <Link
                                to="/admin/restaurants"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Utensils className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">Manage Restaurants</p>
                                    <p className="text-sm text-gray-600">Add or edit restaurants and menus</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard