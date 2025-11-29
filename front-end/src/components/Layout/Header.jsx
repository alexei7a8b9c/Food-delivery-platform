import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { ShoppingCart, User, LogOut, Utensils } from 'lucide-react'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, token } = useSelector(state => state.auth)
    const { items } = useSelector(state => state.cart)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 text-orange-500">
                        <Utensils size={28} />
                        <span className="text-xl font-bold">FoodDelivery</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link to="/restaurants" className="text-gray-700 hover:text-orange-500 transition-colors">
                            Рестораны
                        </Link>

                        {user && (
                            <Link to="/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
                                Мои заказы
                            </Link>
                        )}

                        {user?.roles?.includes('ADMIN') && (
                            <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">
                                Панель управления
                            </Link>
                        )}
                    </nav>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {token ? (
                            <>
                                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
                                    <ShoppingCart size={20} />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                                    )}
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center space-x-2 p-2 text-gray-700 hover:text-orange-500 transition-colors"
                                    >
                                        <User size={20} />
                                        <span>{user?.fullName || user?.email}</span>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                <span>Выйти</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-orange-500 transition-colors"
                                >
                                    Войти
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header