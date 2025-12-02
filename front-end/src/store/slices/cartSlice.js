import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: JSON.parse(localStorage.getItem('cart')) || [],
        restaurantId: null,
    },
    reducers: {
        addToCart: (state, action) => {
            const { dish, restaurantId } = action.payload

            if (state.restaurantId && state.restaurantId !== restaurantId) {
                state.items = []
            }

            state.restaurantId = restaurantId

            const existingItem = state.items.find(item => item.id === dish.id)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push({ ...dish, quantity: 1 })
            }

            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        removeFromCart: (state, action) => {
            const dishId = action.payload
            state.items = state.items.filter(item => item.id !== dishId)

            if (state.items.length === 0) {
                state.restaurantId = null
            }

            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        updateQuantity: (state, action) => {
            const { dishId, quantity } = action.payload
            const item = state.items.find(item => item.id === dishId)

            if (item) {
                if (quantity <= 0) {
                    state.items = state.items.filter(item => item.id !== dishId)
                } else {
                    item.quantity = quantity
                }
            }

            localStorage.setItem('cart', JSON.stringify(state.items))
        },
        clearCart: (state) => {
            state.items = []
            state.restaurantId = null
            localStorage.removeItem('cart')
        },
    },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer