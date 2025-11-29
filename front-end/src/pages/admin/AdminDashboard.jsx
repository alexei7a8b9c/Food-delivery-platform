import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { restaurantService } from '../../services/restaurantService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingBag, Utensils, Users, DollarSign, TrendingUp, Package } from 'lucide-react'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalRestaurants: 0
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [orderStats, setOrderStats] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [ordersResponse, restaurantsResponse, statisticsResponse] = await Promise.all([
                orderService.getAllOrders(),
                restaurantService.getAllRestaurants(),
                orderService.getOrderStatistics()
            ])

            const orders = ordersResponse.data
            const restaurants = restaurantsResponse.data
            const statistics = statisticsResponse.data

            // Calculate stats
            const totalRevenue = orders
                .filter(order => order.status === 'DELIVERED')
                .reduce((sum, order) => sum + order.totalPrice, 0)

            const pendingOrders = orders.filter(order =>
                ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
            ).length

            setStats({
                totalOrders: statistics.totalOrders,
                pendingOrders: statistics.pendingOrders,
                totalRevenue,
                totalRestaurants: restaurants.length
            })

            // Recent orders
            setRecentOrders(orders.slice(0, 5))

            // Order status distribution for chart
            const statusCount = orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1
                return acc
            }, {})

            const statusData = [
                { status: 'Доставлены', count: statusCount.DELIVERED || 0 },
                { status: 'В работе', count: pendingOrders },
                { status: 'Отменены', count: statusCount.CANCELLED || 0 }
            ]

            setOrderStats(statusData)

        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Ожидает' },
            'CONFIRMED': { color: 'bg-blue-100 text-blue-800', text: 'Подтвержден' },
            'PREPARING': { color: 'bg-orange-100 text-orange-800', text: 'Готовится' },
            'OUT_FOR_DELIVERY': { color: 'bg-purple-100 text-purple-800', text: 'В пути' },
            'DELIVERED': { color: 'bg-green-100 text-green-800', text: 'Доставлен' },
            'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Отменен' }
        }

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
        )
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель управления</h1>
                <p className="text-gray-600">Обзор статистики и управление системой</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <ShoppingBag className="text-blue-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Всего заказов</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Package className="text-orange-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Заказов в работе</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Общая выручка</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue} ₽</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Utensils className="text-purple-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Ресторанов</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика заказов</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Последние заказы</h3>
                        <Link
                            to="/admin/orders"
                            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                            Все заказы →
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Заказ #{order.id}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{order.totalPrice} ₽</p>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
                        ))}

                        {recentOrders.length === 0 && (
                            <p className="text-gray-500 text-center py-4">Нет recent заказов</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/admin/restaurants"
                        className="flex items-center p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                        <Utensils className="text-orange-500 mr-3" size={20} />
                        <div>
                            <p className="font-medium text-gray-900">Управление ресторанами</p>
                            <p className="text-sm text-gray-600">Добавление и редактирование</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="flex items-center p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                    >
                        <ShoppingBag className="text-orange-500 mr-3" size={20} />
                        <div>
                            <p className="font-medium text-gray-900">Управление заказами</p>
                            <p className="text-sm text-gray-600">Просмотр и обновление статусов</p>
                        </div>
                    </Link>

                    <div className="flex items-center p-4 border rounded-lg bg-gray-50">
                        <TrendingUp className="text-gray-400 mr-3" size={20} />
                        <div>
                            <p className="font-medium text-gray-900">Аналитика</p>
                            <p className="text-sm text-gray-600">Детальная статистика</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard