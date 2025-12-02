import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.js'
import Home from './pages/Home.js'
import Login from './pages/Login.js'
import Register from './pages/Register.js'
import Cart from './pages/Cart.js'
import Orders from './pages/Orders.js'
import Restaurants from './pages/Restaurants.js'
import RestaurantMenu from './pages/RestaurantMenu.js'
import OrderDetails from './pages/OrderDetails.js'
import ProtectedRoute from './components/Layout/ProtectedRoute.js'
import AdminDashboard from './pages/admin/AdminDashboard.js'
import AdminOrders from './pages/admin/AdminOrders.js'
import AdminRestaurants from './pages/admin/AdminRestaurants.js'
import AllDishes from './pages/admin/AllDishes.js'

function App() {
    return (
        <Layout>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />

                {/* Protected user routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/restaurants" element={<AdminRestaurants />} />
                    <Route path="/admin/dishes" element={<AllDishes />} />
                </Route>
            </Routes>
        </Layout>
    )
}

export default App