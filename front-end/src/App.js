import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.js'
import Home from './pages/Home.js'
import Login from './pages/Login.js'
import Register from './pages/Register.js'
import Restaurants from './pages/Restaurants.js'
import RestaurantMenu from './pages/RestaurantMenu.js'
import AllDishes from './pages/AllDishes.js'
import Cart from './pages/Cart.js'
import Orders from './pages/Orders.js'
import OrderDetails from './pages/OrderDetails.js'
import AdminDashboard from './pages/admin/AdminDashboard.js'
import AdminOrders from './pages/admin/AdminOrders.js'
import AdminRestaurants from './pages/admin/AdminRestaurants.js'
import ProtectedRoute from './components/Layout/ProtectedRoute.js'

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:id" element={<RestaurantMenu />} />
                <Route path="/dishes" element={<AllDishes />} />

                {/* Protected Routes */}
                <Route path="/cart" element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                } />

                <Route path="/orders" element={
                    <ProtectedRoute>
                        <Orders />
                    </ProtectedRoute>
                } />

                <Route path="/orders/:id" element={
                    <ProtectedRoute>
                        <OrderDetails />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/admin/orders" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminOrders />
                    </ProtectedRoute>
                } />

                <Route path="/admin/restaurants" element={
                    <ProtectedRoute requireAdmin={true}>
                        <AdminRestaurants />
                    </ProtectedRoute>
                } />
            </Routes>
        </Layout>
    )
}

export default App