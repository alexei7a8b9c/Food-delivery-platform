import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice.js'

const Header = () => {
    const { user } = useSelector((state) => state.auth)
    const { items } = useSelector((state) => state.cart)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-green-600">
                        Food Delivery
                    </Link>

                    <nav className="flex items-center space-x-6">
                        <Link to="/restaurants" className="text-gray-700 hover:text-green-600">
                            Restaurants
                        </Link>

                        {user ? (
                            <>
                                <Link to="/orders" className="text-gray-700 hover:text-green-600">
                                    My Orders
                                </Link>

                                {user.roles?.includes('ADMIN') && (
                                    <Link to="/admin" className="text-gray-700 hover:text-green-600">
                                        Admin
                                    </Link>
                                )}

                                <Link to="/cart" className="relative text-gray-700 hover:text-green-600">
                                    Cart
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                                    )}
                                </Link>

                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">Hello, {user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-green-600">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header