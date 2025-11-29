import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        restaurantId: null,
        total: 0
    },
    reducers: {
        addToCart: (state, action) => {
            const { dish, restaurantId } = action.payload

            if (state.restaurantId && state.restaurantId !== restaurantId) {
                // Очищаем корзину если ресторан другой
                state.items = []
                state.restaurantId = restaurantId
            } else {
                state.restaurantId = restaurantId
            }

            const existingItem = state.items.find(item => item.dishId === dish.dishId)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push({ ...dish, quantity: 1 })
            }

            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        },
        removeFromCart: (state, action) => {
            const dishId = action.payload
            state.items = state.items.filter(item => item.dishId !== dishId)
            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

            if (state.items.length === 0) {
                state.restaurantId = null
            }
        },
        updateQuantity: (state, action) => {
            const { dishId, quantity } = action.payload
            const item = state.items.find(item => item.dishId === dishId)

            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter(item => item.dishId !== dishId)
                } else {
                    item.quantity = quantity
                }
            }

            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

            if (state.items.length === 0) {
                state.restaurantId = null
            }
        },
        clearCart: (state) => {
            state.items = []
            state.restaurantId = null
            state.total = 0
        }
    }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer