import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaHistory, FaLock } from 'react-icons/fa';

// Используем кастомный хук вместо прямого импорта
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        telephone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                telephone: user.telephone || '',
                address: user.address || '',
            });

            // Здесь можно загрузить заказы пользователя
            // fetchUserOrders();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);

            const result = await updateProfile(formData);

            if (result.success) {
                setIsEditing(false);
                toast.success('Профиль успешно обновлен');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Ошибка обновления профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = () => {
        toast.info('Функция смены пароля в разработке');
    };

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FaUser style={{ marginRight: '10px' }} />
                    Мой профиль
                </h1>
                <div style={styles.userRole}>
                    {user.roles && user.roles.includes('ROLE_ADMIN') && (
                        <span style={styles.adminBadge}>Администратор</span>
                    )}
                    {user.roles && user.roles.includes('ROLE_MANAGER') && (
                        <span style={styles.managerBadge}>Менеджер</span>
                    )}
                    <span style={styles.userBadge}>Пользователь</span>
                </div>
            </div>

            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'profile' && styles.tabButtonActive)
                    }}
                >
                    <FaUser style={{ marginRight: '8px' }} />
                    Профиль
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'orders' && styles.tabButtonActive)
                    }}
                >
                    <FaHistory style={{ marginRight: '8px' }} />
                    Мои заказы
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'security' && styles.tabButtonActive)
                    }}
                >
                    <FaLock style={{ marginRight: '8px' }} />
                    Безопасность
                </button>
            </div>

            {activeTab === 'profile' && (
                <div style={styles.profileSection}>
                    <div style={styles.profileCard}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Личная информация</h2>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                style={styles.editButton}
                                disabled={loading}
                            >
                                {isEditing ? (
                                    <>
                                        <FaSave style={{ marginRight: '8px' }} />
                                        {loading ? 'Сохранение...' : 'Сохранить'}
                                    </>
                                ) : (
                                    <>
                                        <FaEdit style={{ marginRight: '8px' }} />
                                        Редактировать
                                    </>
                                )}
                            </button>
                        </div>

                        <div style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaUser style={styles.labelIcon} />
                                    Полное имя
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                ) : (
                                    <div style={styles.value}>{user.fullName}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaEnvelope style={styles.labelIcon} />
                                    Email адрес
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        disabled={true} // Email нельзя менять
                                    />
                                ) : (
                                    <div style={styles.value}>{user.email}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaPhone style={styles.labelIcon} />
                                    Телефон
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleInputChange}
                                        placeholder="+7 (999) 123-45-67"
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                ) : (
                                    <div style={styles.value}>{user.telephone || 'Не указан'}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <FaMapMarkerAlt style={styles.labelIcon} />
                                    Адрес доставки
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Введите адрес доставки"
                                        style={styles.textarea}
                                        rows="3"
                                        disabled={loading}
                                    />
                                ) : (
                                    <div style={styles.value}>{user.address || 'Не указан'}</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.stats}>
                            <div style={styles.stat}>
                                <div style={styles.statValue}>15</div>
                                <div style={styles.statLabel}>Всего заказов</div>
                            </div>
                            <div style={styles.stat}>
                                <div style={styles.statValue}>12</div>
                                <div style={styles.statLabel}>Выполнено</div>
                            </div>
                            <div style={styles.stat}>
                                <div style={styles.statValue}>3</div>
                                <div style={styles.statLabel}>В процессе</div>
                            </div>
                            <div style={styles.stat}>
                                <div style={styles.statValue}>4.8</div>
                                <div style={styles.statLabel}>Рейтинг</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div style={styles.ordersSection}>
                    <div style={styles.ordersCard}>
                        <h2 style={styles.cardTitle}>История заказов</h2>
                        {orders.length === 0 ? (
                            <div style={styles.emptyOrders}>
                                <p>У вас пока нет заказов</p>
                                <p style={styles.emptyOrdersText}>
                                    Сделайте свой первый заказ и он появится здесь
                                </p>
                            </div>
                        ) : (
                            <div style={styles.ordersList}>
                                {/* Здесь будет список заказов */}
                                <p>Список заказов будет загружен</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div style={styles.securitySection}>
                    <div style={styles.securityCard}>
                        <h2 style={styles.cardTitle}>Безопасность</h2>

                        <div style={styles.securityItem}>
                            <h3 style={styles.securityTitle}>Смена пароля</h3>
                            <p style={styles.securityText}>
                                Рекомендуем регулярно менять пароль для обеспечения безопасности аккаунта
                            </p>
                            <button onClick={handleChangePassword} style={styles.changePasswordBtn}>
                                Сменить пароль
                            </button>
                        </div>

                        <div style={styles.securityItem}>
                            <h3 style={styles.securityTitle}>Двухфакторная аутентификация</h3>
                            <p style={styles.securityText}>
                                Добавьте дополнительный уровень безопасности к вашему аккаунту
                            </p>
                            <button style={styles.enable2faBtn}>
                                Включить 2FA
                            </button>
                        </div>

                        <div style={styles.securityItem}>
                            <h3 style={styles.securityTitle}>Активные сессии</h3>
                            <p style={styles.securityText}>
                                Управляйте устройствами, на которых выполнен вход в ваш аккаунт
                            </p>
                            <button style={styles.viewSessionsBtn}>
                                Просмотреть сессии
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px',
    },
    spinner: {
        border: '4px solid rgba(0, 0, 0, 0.1)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        borderLeftColor: '#ff6b35',
        animation: 'spin 1s linear infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '2rem',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
    },
    userRole: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    adminBadge: {
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    managerBadge: {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    userBadge: {
        backgroundColor: '#2ecc71',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        overflowX: 'auto',
        paddingBottom: '10px',
    },
    tabButton: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
    tabButtonActive: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        color: 'white',
    },
    profileSection: {},
    profileCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    cardTitle: {
        fontSize: '1.5rem',
        color: '#2c3e50',
    },
    editButton: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
        ':disabled': {
            backgroundColor: '#95a5a6',
            cursor: 'not-allowed',
        },
    },
    form: {
        display: 'grid',
        gap: '25px',
        marginBottom: '40px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    labelIcon: {
        marginRight: '8px',
        color: '#ff6b35',
        fontSize: '0.9rem',
    },
    input: {
        padding: '12px 15px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#ff6b35',
        },
        ':disabled': {
            backgroundColor: '#f8f9fa',
            cursor: 'not-allowed',
        },
    },
    textarea: {
        padding: '12px 15px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '1rem',
        resize: 'vertical',
        transition: 'border-color 0.3s ease',
        ':focus': {
            outline: 'none',
            borderColor: '#ff6b35',
        },
        ':disabled': {
            backgroundColor: '#f8f9fa',
            cursor: 'not-allowed',
        },
    },
    value: {
        padding: '12px 15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '1rem',
        color: '#2c3e50',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px',
        paddingTop: '30px',
        borderTop: '1px solid #e9ecef',
    },
    stat: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#ff6b35',
        marginBottom: '5px',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    ordersSection: {},
    ordersCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    emptyOrders: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#7f8c8d',
    },
    emptyOrdersText: {
        fontSize: '0.9rem',
        marginTop: '10px',
    },
    ordersList: {
        // Стили для списка заказов
    },
    securitySection: {},
    securityCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    securityItem: {
        marginBottom: '30px',
        paddingBottom: '30px',
        borderBottom: '1px solid #e9ecef',
        ':last-child': {
            marginBottom: 0,
            paddingBottom: 0,
            borderBottom: 'none',
        },
    },
    securityTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px',
    },
    securityText: {
        color: '#7f8c8d',
        marginBottom: '15px',
        fontSize: '0.95rem',
    },
    changePasswordBtn: {
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#e55a2e',
        },
    },
    enable2faBtn: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: '#2980b9',
        },
    },
    viewSessionsBtn: {
        backgroundColor: '#f8f9fa',
        color: '#495057',
        border: '2px solid #e9ecef',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            borderColor: '#ff6b35',
            color: '#ff6b35',
        },
    },
};

export default Profile;