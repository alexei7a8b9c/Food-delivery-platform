// Константы приложения
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Роли пользователей
export const ROLES = {
    USER: 'ROLE_USER',
    MANAGER: 'ROLE_MANAGER',
    ADMIN: 'ROLE_ADMIN'
};

// Статусы заказов
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

// Кухни ресторанов
export const CUISINES = [
    'All',
    'Italian',
    'Chinese',
    'American',
    'Japanese',
    'Mexican',
    'French',
    'Indian',
    'Thai',
    'Mediterranean',
    'Korean',
    'Vietnamese'
];

// Методы оплаты
export const PAYMENT_METHODS = [
    { value: 'CREDIT_CARD', label: 'Банковская карта' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'CASH', label: 'Наличные' }
];

// Цвета для кухонь
export const CUISINE_COLORS = {
    'Italian': '#e74c3c',
    'Chinese': '#3498db',
    'American': '#2ecc71',
    'Japanese': '#9b59b6',
    'Mexican': '#e67e22',
    'French': '#1abc9c',
    'Indian': '#f1c40f',
    'Thai': '#d35400',
    'Mediterranean': '#16a085',
    'Korean': '#8e44ad',
    'Vietnamese': '#27ae60'
};

// Локализация
export const LOCALIZATION = {
    ru: {
        currency: '₽',
        currencyFormat: new Intl.NumberFormat('ru-RU'),
        dateFormat: new Intl.DateTimeFormat('ru-RU')
    }
};

// Цены доставки
export const DELIVERY_FEES = {
    standard: 150,
    freeThreshold: 1000,
    express: 300
};

// Время доставки
export const DELIVERY_TIMES = {
    standard: '30-45 мин',
    express: '15-25 мин'
};