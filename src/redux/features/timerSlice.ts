// src/redux/features/timerSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface TimerSession {
    _id: string;
    userId: string;
    selectedDuration: number; // Dəqiqə ilə olmalıdır
    startTime: string; 
    endTime: string | null;
    elapsedTime: number;
    status: 'running' | 'stopped' | 'completed' | 'reset';
    createdAt: string;
    updatedAt: string;
}

interface TimerState {
    currentTimer: TimerSession | null;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TimerState = {
    currentTimer: null,
    loading: 'idle',
    error: null,
};

// --- Async Thunk for createTimerSession API Call ---

// Yeni taymer sessiyası yaratmaq (Start Timer)
// src/redux/features/timerSlice.ts içindəki createTimerSession thunk-ı
// src/redux/features/timerSlice.ts
// ... digər importlar və interfacelər

export const createTimerSession = createAsyncThunk(
    'timer/createTimerSession',
    async (selectedDuration: number, thunkAPI) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/timers`,
                { selectedDuration },
                {
                    // Authorization header-ini SİLİRİK, çünki cookie istifadə edirik
                    withCredentials: true // Brauzerin cookie-lərini sorğu ilə göndər
                }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası yaradıla bilmədi.');
        }
    }
);
// ... qalan slice kodu

const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        // Reducer-lərdə hələlik heç nə yoxdur, çünki bütün məntiq thunk-da idarə olunur.
        // Gələcəkdə "clearCurrentTimer" və ya "updateTimerProgress" kimi reducer-lər əlavə oluna bilər.
        clearCurrentTimer: (state) => {
            state.currentTimer = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // createTimerSession pending (sorğu göndərilir)
            .addCase(createTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            // createTimerSession fulfilled (sorğu uğurludur)
            .addCase(createTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentTimer = action.payload; // Backend-dən gələn yeni sessiyanı qeyd edirik
            })
            // createTimerSession rejected (sorğu xəta ilə nəticələnir)
            .addCase(createTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentTimer } = timerSlice.actions; // Hələlik yalnız bu reducer
export default timerSlice.reducer;