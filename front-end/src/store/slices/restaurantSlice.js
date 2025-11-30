import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../../services/restaurantService'

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchRestaurants',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Starting to fetch restaurants...')
            const response = await restaurantService.getAllRestaurants()
            console.log('Fetched restaurants successfully:', response)
            return response
        } catch (error) {
            console.error('Failed to fetch restaurants:', error)
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
            console.log(`Fetching menu for restaurant ${restaurantId}...`)
            const response = await restaurantService.getRestaurantMenu(restaurantId)
            console.log(`Fetched menu for restaurant ${restaurantId}:`, response)
            return response
        } catch (error) {
            console.error(`Failed to fetch menu for restaurant ${restaurantId}:`, error)
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
                state.error = null
            })
            .addCase(fetchRestaurants.fulfilled, (state, action) => {
                state.isLoading = false
                state.restaurants = action.payload
                state.error = null
                console.log('Restaurants updated in state:', action.payload)
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                console.error('Restaurants fetch failed:', action.payload)
            })
            // Fetch Restaurant by ID
            .addCase(fetchRestaurantById.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchRestaurantById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentRestaurant = action.payload
                state.error = null
            })
            .addCase(fetchRestaurantById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Fetch Restaurant Menu
            .addCase(fetchRestaurantMenu.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
                state.isLoading = false
                state.menu = action.payload
                state.error = null
                console.log('Menu updated in state:', action.payload)
            })
            .addCase(fetchRestaurantMenu.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { clearRestaurantError, clearCurrentRestaurant } = restaurantSlice.actions
export default restaurantSlice.reducer