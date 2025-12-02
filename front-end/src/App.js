import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Restaurants from './pages/Restaurants.js';
import RestaurantMenu from './pages/RestaurantMenu.js';
import AllDishes from './pages/AllDishes.js';
import Cart from './pages/Cart.js';
import Orders from './pages/Orders.js';
import OrderDetails from './pages/OrderDetails.js';
import AdminDashboard from './pages/admin/AdminDashboard.js';
import AdminOrders from './pages/admin/AdminOrders.js';
import AdminRestaurants from './pages/admin/AdminRestaurants.js';
import ProtectedRoute from './components/Layout/ProtectedRoute.js';

function App() {
    return React.createElement(Layout, null,
        React.createElement(Routes, null,
            React.createElement(Route, { path: "/", element: React.createElement(Home) }),
            React.createElement(Route, { path: "/login", element: React.createElement(Login) }),
            React.createElement(Route, { path: "/register", element: React.createElement(Register) }),
            React.createElement(Route, { path: "/restaurants", element: React.createElement(Restaurants) }),
            React.createElement(Route, { path: "/restaurants/:id", element: React.createElement(RestaurantMenu) }),
            React.createElement(Route, { path: "/dishes", element: React.createElement(AllDishes) }),
            React.createElement(Route, {
                path: "/cart",
                element: React.createElement(ProtectedRoute, null, React.createElement(Cart))
            }),
            React.createElement(Route, {
                path: "/orders",
                element: React.createElement(ProtectedRoute, null, React.createElement(Orders))
            }),
            React.createElement(Route, {
                path: "/orders/:id",
                element: React.createElement(ProtectedRoute, null, React.createElement(OrderDetails))
            }),
            React.createElement(Route, {
                path: "/admin",
                element: React.createElement(ProtectedRoute, { requireAdmin: true },
                    React.createElement(AdminDashboard)
                )
            }),
            React.createElement(Route, {
                path: "/admin/orders",
                element: React.createElement(ProtectedRoute, { requireAdmin: true },
                    React.createElement(AdminOrders)
                )
            }),
            React.createElement(Route, {
                path: "/admin/restaurants",
                element: React.createElement(ProtectedRoute, { requireAdmin: true },
                    React.createElement(AdminRestaurants)
                )
            })
        )
    );
}

export default App;