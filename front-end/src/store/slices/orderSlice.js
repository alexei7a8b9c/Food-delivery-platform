import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../services/orderService'

export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getUserOrders()
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch orders')
        }
    }
)

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch order')
        }
    }
)

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        userOrders: [],
        currentOrder: null,
        loading: false,
        error: null
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch user orders
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false
                state.userOrders = action.payload
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false
                state.currentOrder = action.payload
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { clearCurrentOrder, clearError } = orderSlice.actions
export default orderSlice.reducer