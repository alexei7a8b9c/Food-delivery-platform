import React, { useState, useEffect, useCallback } from 'react'; // Добавляем useCallback
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/common.css';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Используем useCallback
    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/profile', {
                headers: {
                    'X-User-Id': user.userId
                }
            });
            setProfile(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Не удалось загрузить профиль');
        } finally {
            setLoading(false);
        }
    }, [user.userId]); // Зависимость

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]); // Теперь зависимость стабильна

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка профиля...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    <h2>{error}</h2>
                    <button onClick={fetchUserProfile} className="btn btn-primary">
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="profile-header">
                <h1>Мой профиль</h1>
            </div>

            <div className="profile-card">
                <div className="profile-info">
                    <div className="profile-field">
                        <label>Имя:</label>
                        <span>{profile.fullName}</span>
                    </div>
                    <div className="profile-field">
                        <label>Email:</label>
                        <span>{profile.email}</span>
                    </div>
                    {profile.telephone && (
                        <div className="profile-field">
                            <label>Телефон:</label>
                            <span>{profile.telephone}</span>
                        </div>
                    )}
                    <div className="profile-field">
                        <label>Дата регистрации:</label>
                        <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;