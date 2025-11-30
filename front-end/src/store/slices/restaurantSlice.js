import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../../services/restaurantService'

export const fetchRestaurants = createAsyncThunk(
    'restaurants/fetchRestaurants',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Starting to fetch restaurants from backend...')
            const response = await restaurantService.getAllRestaurants()
            console.log('Successfully fetched restaurants:', response.length)
            return response
        } catch (error) {
            console.error('Failed to fetch restaurants:', error)
            return rejectWithValue(error.message || 'Failed to fetch restaurants from server')
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
            return rejectWithValue(error.message || 'Failed to fetch restaurant')
        }
    }
)

export const fetchRestaurantMenu = createAsyncThunk(
    'restaurants/fetchRestaurantMenu',
    async (restaurantId, { rejectWithValue }) => {
        try {
            console.log(`Fetching menu for restaurant ${restaurantId} from backend...`)
            const response = await restaurantService.getRestaurantMenu(restaurantId)
            console.log(`Successfully fetched menu with ${response.length} items`)
            return response
        } catch (error) {
            console.error(`Failed to fetch menu for restaurant ${restaurantId}:`, error)
            return rejectWithValue(error.message || 'Failed to fetch menu from server')
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
        lastFetch: null
    },
    reducers: {
        clearRestaurantError: (state) => {
            state.error = null
        },
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null
            state.menu = []
        },
        clearAllData: (state) => {
            state.restaurants = []
            state.currentRestaurant = null
            state.menu = []
            state.error = null
        }
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
                state.lastFetch = new Date().toISOString()
                console.log('Updated restaurants in Redux store:', action.payload.length)
            })
            .addCase(fetchRestaurants.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                console.error('Restaurants fetch failed in Redux:', action.payload)
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
                console.log('Updated menu in Redux store:', action.payload.length)
            })
            .addCase(fetchRestaurantMenu.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { clearRestaurantError, clearCurrentRestaurant, clearAllData } = restaurantSlice.actions
export default restaurantSlice.reducer