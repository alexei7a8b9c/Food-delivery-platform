import React, { useState, useEffect } from 'react';
import '../styles/common.css';
import api from '../services/api';
import { FaUsers, FaUtensils, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Здесь можно добавить реальные запросы к API
            // Пока используем фиктивные данные
            setStats({
                totalUsers: 156,
                totalRestaurants: 24,
                totalOrders: 892,
                totalRevenue: 45678
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="stats-grid grid grid-4 mt-20">
                <div className="stat-card card">
                    <FaUsers size={40} color="#007bff" />
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                </div>

                <div className="stat-card card">
                    <FaUtensils size={40} color="#28a745" />
                    <h3>Restaurants</h3>
                    <p className="stat-number">{stats.totalRestaurants}</p>
                </div>

                <div className="stat-card card">
                    <FaShoppingCart size={40} color="#ffc107" />
                    <h3>Total Orders</h3>
                    <p className="stat-number">{stats.totalOrders}</p>
                </div>

                <div className="stat-card card">
                    <FaDollarSign size={40} color="#dc3545" />
                    <h3>Revenue</h3>
                    <p className="stat-number">${stats.totalRevenue}</p>
                </div>
            </div>

            <div className="admin-sections mt-20">
                <div className="card">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="btn btn-primary">Add Restaurant</button>
                        <button className="btn btn-secondary">Manage Users</button>
                        <button className="btn btn-success">View Orders</button>
                        <button className="btn btn-info">Analytics</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;