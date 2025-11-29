import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../../services/restaurantService'

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchRestaurants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await restaurantService.getAllRestaurants()
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch restaurants')
        }
    }
)

export const fetchRestaurantDishes = createAsyncThunk(
    'restaurants/fetchRestaurantDishes',
    async (restaurantId, { rejectWithValue }) => {
        try {
            const response = await restaurantService.getRestaurantDishes(restaurantId)
            return { restaurantId, dishes: response.data }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch dishes')
        }
    }
)

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState: {
        restaurants: [],
        dishes: {},
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch restaurants
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
            // Fetch restaurant dishes
            .addCase(fetchRestaurantDishes.fulfilled, (state, action) => {
                const { restaurantId, dishes } = action.payload
                state.dishes[restaurantId] = dishes
            })
    }
})

export const { clearError } = restaurantSlice.actions
export default restaurantSlice.reducer