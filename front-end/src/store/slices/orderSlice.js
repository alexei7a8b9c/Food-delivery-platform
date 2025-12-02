import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../services/orderService.js'

export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData, { rejectWithValue }) => {
        try {
            return await orderService.createOrder(orderData)
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Order creation failed')
        }
    }
)

export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getUserOrders()
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
        }
    }
)

export const getOrderById = createAsyncThunk(
    'order/getById',
    async (orderId, { rejectWithValue }) => {
        try {
            return await orderService.getOrderById(orderId)
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
        }
    }
)

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false
                state.currentOrder = action.payload
                state.orders.unshift(action.payload)
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false
                state.orders = action.payload
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(getOrderById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false
                state.currentOrder = action.payload
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearCurrentOrder, clearError } = orderSlice.actions
export default orderSlice.reducer