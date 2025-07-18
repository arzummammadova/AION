// src/redux/slices/trackSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Track interfeysi
export interface Track {
    _id: string;
    name: string;
    artist: string;
    audioUrl: string;
    imageUrl?: string;
}

// State interfeysi
interface TracksState {
    tracks: Track[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

// İlkin state
const initialState: TracksState = {
    tracks: [],
    loading: 'idle',
    error: null,
};

// Asinxron thunk: Mahnıları çəkmək üçün
export const getTracks = createAsyncThunk<Track[], void>(
    'tracks/getTracks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tracks`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const trackSlice = createSlice({
    name: 'tracks',
    initialState,
    reducers: {
        // Yeni reducer: Mahnıların sırasını yeniləmək üçün
        updateTracksOrder: (state, action: PayloadAction<Track[]>) => {
            state.tracks = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTracks.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(getTracks.fulfilled, (state, action: PayloadAction<Track[]>) => {
                state.loading = 'succeeded';
                state.tracks = action.payload;
                state.error = null;
            })
            .addCase(getTracks.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

// Yeni reducer-i export edin
export const { updateTracksOrder } = trackSlice.actions;

export default trackSlice.reducer;