import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../../services/restaurantService.js'

export const fetchRestaurants = createAsyncThunk(
    'restaurant/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await restaurantService.getAllRestaurants()
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants')
        }
    }
)

export const fetchRestaurantMenu = createAsyncThunk(
    'restaurant/fetchMenu',
    async (restaurantId, { rejectWithValue }) => {
        try {
            return await restaurantService.getRestaurantMenu(restaurantId)
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu')
        }
    }
)

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState: {
        restaurants: [],
        currentRestaurant: null,
        menu: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null
            state.menu = []
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRestaurants.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.loading = false
                state.restaurants = action.payload
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchRestaurantMenu.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
                state.loading = false
                state.currentRestaurant = action.payload.restaurant
                state.menu = action.payload.dishes
            })
            .addCase(fetchRestaurantMenu.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearCurrentRestaurant, clearError } = restaurantSlice.actions
export default restaurantSlice.reducer