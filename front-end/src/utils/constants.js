export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
}

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Ожидает подтверждения',
    [ORDER_STATUS.CONFIRMED]: 'Подтвержден',
    [ORDER_STATUS.PREPARING]: 'Готовится',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'В пути',
    [ORDER_STATUS.DELIVERED]: 'Доставлен',
    [ORDER_STATUS.CANCELLED]: 'Отменен'
}

export const PAYMENT_METHODS = {
    CREDIT_CARD: 'CREDIT_CARD',
    PAYPAL: 'PAYPAL',
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY'
}

export const CUISINE_TYPES = [
    'Italian',
    'Chinese',
    'American',
    'Japanese',
    'Mexican',
    'French',
    'Indian',
    'Thai',
    'Mediterranean'
]