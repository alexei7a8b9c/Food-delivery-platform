import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Restaurants from './pages/Restaurants'
import RestaurantMenu from './pages/RestaurantMenu'
import AllDishes from './pages/AllDishes' // Новая страница
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:id" element={<RestaurantMenu />} />
                <Route path="/dishes" element={<AllDishes />} /> {/* Новый маршрут */}

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