import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUser, FaEnvelope, FaPhone, FaEdit } from 'react-icons/fa';

function Profile() {
    const { user, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.userId) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/api/users/profile`, {
                headers: { 'X-User-Id': user.userId }
            });
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header card">
                <div className="profile-avatar">
                    <FaUser size={80} />
                </div>

                <div className="profile-info">
                    <h1>{userData?.fullName || user?.fullName}</h1>
                    <p className="profile-email">
                        <FaEnvelope /> {userData?.email || user?.email}
                    </p>
                    {userData?.telephone && (
                        <p className="profile-phone">
                            <FaPhone /> {userData.telephone}
                        </p>
                    )}
                </div>
            </div>

            <div className="profile-sections mt-20">
                <div className="card">
                    <h3>Account Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Member Since</label>
                            <p>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="info-item">
                            <label>User ID</label>
                            <p>{user?.userId}</p>
                        </div>
                    </div>
                </div>

                <div className="card mt-20">
                    <h3>Actions</h3>
                    <div className="action-buttons">
                        <button className="btn btn-secondary">
                            <FaEdit /> Edit Profile
                        </button>
                        <button onClick={logout} className="btn btn-danger">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;