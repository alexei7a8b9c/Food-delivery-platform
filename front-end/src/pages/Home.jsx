import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingBag, Utensils, Truck } from 'lucide-react'

const Home = () => {
    const { user } = useSelector(state => state.auth)

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Добро пожаловать в Food Delivery
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Заказывайте любимые блюда из лучших ресторанов города с быстрой доставкой до двери
                    </p>

                    {!user ? (
                        <div className="space-x-4">
                            <Link
                                to="/register"
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Начать заказывать
                            </Link>
                            <Link
                                to="/login"
                                className="border border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                            >
                                Войти в аккаунт
                            </Link>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link
                                to="/restaurants"
                                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Смотреть рестораны
                            </Link>
                            {user.roles?.includes('ADMIN') && (
                                <Link
                                    to="/admin"
                                    className="border border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                                >
                                    Панель управления
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Utensils className="text-orange-500" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Разнообразные рестораны</h3>
                        <p className="text-gray-600">
                            Выбирайте из сотен ресторанов с различными кухнями мира
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="text-orange-500" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Простой заказ</h3>
                        <p className="text-gray-600">
                            Легко добавляйте блюда в корзину и оформляйте заказ в несколько кликов
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="text-orange-500" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
                        <p className="text-gray-600">
                            Получайте заказы быстро с нашей надежной службой доставки
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home