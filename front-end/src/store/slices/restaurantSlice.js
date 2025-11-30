import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../../services/restaurantService'

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchRestaurants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await restaurantService.getAllRestaurants()
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants')
        }
    }
)

export const fetchRestaurantById = createAsyncThunk(
    'restaurants/fetchRestaurantById',
    async (restaurantId, { rejectWithValue }) => {
        try {
            const response = await restaurantService.getRestaurantById(restaurantId)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant')
        }
    }
)

export const fetchRestaurantMenu = createAsyncThunk(
    'restaurants/fetchRestaurantMenu',
    async (restaurantId, { rejectWithValue }) => {
        try {
            const response = await restaurantService.getRestaurantMenu(restaurantId)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu')
        }
    }
)

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState: {
        restaurants: [],
        currentRestaurant: null,
        menu: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearRestaurantError: (state) => {
            state.error = null
        },
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null
            state.menu = []
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Restaurants
            .addCase(fetchRestaurants.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.isLoading = false
                state.restaurants = action.payload
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Fetch Restaurant by ID
            .addCase(fetchRestaurantById.fulfilled, (state, action) => {
                state.currentRestaurant = action.payload
            })
            // Fetch Restaurant Menu
            .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
                state.menu = action.payload
            })
    },
})

export const { clearRestaurantError, clearCurrentRestaurant } = restaurantSlice.actions
export default restaurantSlice.reducer