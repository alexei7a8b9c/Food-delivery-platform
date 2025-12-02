export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    DELIVERING: 'DELIVERING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
}

export const USER_ROLES = {
    CUSTOMER: 'CUSTOMER',
    RESTAURANT_OWNER: 'RESTAURANT_OWNER',
    ADMIN: 'ADMIN',
}

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
    },
    USERS: {
        PROFILE: '/users/profile',
    },
    RESTAURANTS: '/restaurants',
    ORDERS: '/orders',
    CART: '/cart',
}