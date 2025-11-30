import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../services/orderService'

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getCart()
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
        }
    }
)

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (cartItem, { rejectWithValue }) => {
        try {
            await orderService.addToCart(cartItem)
            return cartItem
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to cart')
        }
    }
)

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ dishId, quantity }, { rejectWithValue }) => {
        try {
            await orderService.updateCartItem(dishId, quantity)
            return { dishId, quantity }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update cart')
        }
    }
)

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (dishId, { rejectWithValue }) => {
        try {
            await orderService.removeFromCart(dishId)
            return dishId
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart')
        }
    }
)

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            await orderService.clearCart()
            return []
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart')
        }
    }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearCartError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Add to Cart
            .addCase(addToCart.fulfilled, (state, action) => {
                const existingItem = state.items.find(item => item.dishId === action.payload.dishId)
                if (existingItem) {
                    existingItem.quantity += action.payload.quantity
                } else {
                    state.items.push(action.payload)
                }
            })
            // Update Cart Item
            .addCase(updateCartItem.fulfilled, (state, action) => {
                const item = state.items.find(item => item.dishId === action.payload.dishId)
                if (item) {
                    if (action.payload.quantity === 0) {
                        state.items = state.items.filter(item => item.dishId !== action.payload.dishId)
                    } else {
                        item.quantity = action.payload.quantity
                    }
                }
            })
            // Remove from Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.dishId !== action.payload)
            })
            // Clear Cart
            .addCase(clearCart.fulfilled, (state) => {
                state.items = []
            })
    },
})

export const { clearCartError } = cartSlice.actions
export default cartSlice.reducer