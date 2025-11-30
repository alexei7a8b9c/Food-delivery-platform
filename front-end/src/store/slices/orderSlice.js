import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../services/orderService'

export const placeOrder = createAsyncThunk(
    'orders/placeOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderService.placeOrder(orderData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to place order')
        }
    }
)

export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getUserOrders()
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
        }
    }
)

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
        }
    }
)

export const cancelOrder = createAsyncThunk(
    'orders/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.cancelOrder(orderId)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel order')
        }
    }
)

// Admin thunks
export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getAllOrders()
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders')
        }
    }
)

export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, status)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update order status')
        }
    }
)

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        currentOrder: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearOrderError: (state) => {
            state.error = null
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Place Order
            .addCase(placeOrder.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.isLoading = false
                state.orders.unshift(action.payload)
                state.currentOrder = action.payload
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Fetch User Orders
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.orders = action.payload
            })
            // Fetch Order by ID
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.currentOrder = action.payload
            })
            // Cancel Order
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const index = state.orders.findIndex(order => order.id === action.payload.id)
                if (index !== -1) {
                    state.orders[index] = action.payload
                }
                if (state.currentOrder?.id === action.payload.id) {
                    state.currentOrder = action.payload
                }
            })
            // Fetch All Orders (Admin)
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.orders = action.payload
            })
            // Update Order Status (Admin)
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(order => order.id === action.payload.id)
                if (index !== -1) {
                    state.orders[index] = action.payload
                }
            })
    },
})

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer