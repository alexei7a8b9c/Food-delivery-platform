import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'white'
                    }}>
                        <Header />
                        <main style={{
                            flex: 1,
                            padding: '20px',
                            backgroundColor: 'white'
                        }}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/restaurants" element={<Restaurants />} />
                                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                                <Route path="/menu" element={<Menu />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;