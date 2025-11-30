export const API_BASE_URL = '/api'

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
}

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.CONFIRMED]: 'Confirmed',
    [ORDER_STATUS.PREPARING]: 'Preparing',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled'
}

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
    [ORDER_STATUS.PREPARING]: 'bg-orange-100 text-orange-800',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'bg-purple-100 text-purple-800',
    [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
    [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
}