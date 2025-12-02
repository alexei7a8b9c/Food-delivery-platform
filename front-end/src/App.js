import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Страницы
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import TestApi from './pages/TestApi';

import './styles/common.css';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/restaurants" element={<Restaurants />} />
                                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                                <Route path="/menu" element={<Menu />} />
                                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                                <Route path="/test" element={<TestApi />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;