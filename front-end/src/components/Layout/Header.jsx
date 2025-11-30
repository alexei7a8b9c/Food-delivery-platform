import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { ShoppingCart, User, LogOut, Utensils, Search } from 'lucide-react'

const Header = () => {
    const { user } = useSelector((state) => state.auth)
    const { items } = useSelector((state) => state.cart)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    const isAdmin = user?.roles?.includes('ADMIN')

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Utensils className="h-8 w-8 text-primary-500" />
                        <span className="text-xl font-bold text-gray-900">FoodDelivery</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/restaurants" className="text-gray-700 hover:text-primary-500 transition-colors">
                            Restaurants
                        </Link>
                        <Link to="/dishes" className="text-gray-700 hover:text-primary-500 transition-colors">
                            All Dishes
                        </Link>
                        {user && (
                            <Link to="/orders" className="text-gray-700 hover:text-primary-500 transition-colors">
                                My Orders
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin" className="text-gray-700 hover:text-primary-500 transition-colors">
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors">
                                    <ShoppingCart className="h-6 w-6" />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                                    )}
                                </Link>
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-500 transition-colors">
                                        <User className="h-6 w-6" />
                                        <span className="hidden sm:block">{user.fullName}</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                            {user.email}
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary-500 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
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