// src/redux/features/timerSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface TimerSession {
    _id: string;
    userId: string;
    selectedDuration: number;
    startTime: string; 
    endTime: string | null;
    elapsedTime: number;
    status: 'running' | 'paused' | 'stopped' | 'completed' | 'reset'; 
    pauseStartTime: string | null; 
    totalPausedTime: number; 
    createdAt: string;
    updatedAt: string;
}

interface TimerState {
    currentTimer: TimerSession | null;
    timerSessions: TimerSession[]; 
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TimerState = {
    currentTimer: null,
    timerSessions: [], 
    loading: 'idle',
    error: null,
};

// --- Async Thunks for Timer API Calls ---

export const startTimerSession = createAsyncThunk(
    'timer/startTimerSession',
    async (selectedDuration: number, thunkAPI) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/start`, 
                { selectedDuration },
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası başlatıla bilmədi.');
        }
    }
);

export const pauseTimerSession = createAsyncThunk(
    'timer/pauseTimerSession',
    async ({ timerId, elapsedTime }: { timerId: string; elapsedTime: number }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/${timerId}/pause`, 
                { elapsedTime },
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası fasiləyə verilə bilmədi.');
        }
    }
);

export const completeTimerSession = createAsyncThunk(
    'timer/completeTimerSession',
    async ({ timerId, elapsedTime }: { timerId: string; elapsedTime: number }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/${timerId}/complete`, 
                { elapsedTime },
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası tamamlana bilmədi.');
        }
    }
);

// YENİ: Taymer sessiyasını tamamilə dayandırmaq (Stopped)
export const stopTimerSession = createAsyncThunk(
    'timer/stopTimerSession',
    async ({ timerId, elapsedTime }: { timerId: string; elapsedTime: number }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/${timerId}/stop`, // Yeni backend route
                { elapsedTime },
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası dayandırıla bilmədi.');
        }
    }
);

export const getUserTimerSessions = createAsyncThunk(
    'timer/getUserTimerSessions',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/me`, 
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyaları alına bilmədi.');
        }
    }
);

export const deleteTimerSession = createAsyncThunk(
    'timer/deleteTimerSession',
    async (timerId: string, thunkAPI) => {
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/${timerId}`,
                { withCredentials: true }
            );
            return timerId; 
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer sessiyası silinə bilmədi.');
        }
    }
);

const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        clearCurrentTimer: (state) => {
            state.currentTimer = null;
        },
        clearAllTimerSessions: (state) => {
            state.timerSessions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // ... (startTimerSession, pauseTimerSession, completeTimerSession extraReducers-ları burada qalır) ...
            .addCase(startTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(startTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentTimer = action.payload.timerSession || action.payload; 
                const index = state.timerSessions.findIndex(
                    (session) => session._id === (action.payload.timerSession?._id || action.payload._id)
                );
                if (index !== -1) {
                    state.timerSessions[index] = action.payload.timerSession || action.payload;
                } else {
                    state.timerSessions.unshift(action.payload.timerSession || action.payload); 
                }
            })
            .addCase(startTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(pauseTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(pauseTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentTimer = action.payload.timerSession || action.payload; 
                const index = state.timerSessions.findIndex(
                    (session) => session._id === (action.payload.timerSession?._id || action.payload._id)
                );
                if (index !== -1) {
                    state.timerSessions[index] = action.payload.timerSession || action.payload;
                }
            })
            .addCase(pauseTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(completeTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(completeTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentTimer = action.payload.timerSession || action.payload; 
                const index = state.timerSessions.findIndex(
                    (session) => session._id === (action.payload.timerSession?._id || action.payload._id)
                );
                if (index !== -1) {
                    state.timerSessions[index] = action.payload.timerSession || action.payload;
                }
            })
            .addCase(completeTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            // YENİ: stopTimerSession extraReducers
            .addCase(stopTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(stopTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.currentTimer = action.payload.timerSession || action.payload; // Güncəllənmiş sessiyanı qeyd et
                // Dayandırılan sessiyanı siyahıda yenilə
                const index = state.timerSessions.findIndex(
                    (session) => session._id === (action.payload.timerSession?._id || action.payload._id)
                );
                if (index !== -1) {
                    state.timerSessions[index] = action.payload.timerSession || action.payload;
                }
            })
            .addCase(stopTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(getUserTimerSessions.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(getUserTimerSessions.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.timerSessions = action.payload; 
            })
            .addCase(getUserTimerSessions.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(deleteTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(deleteTimerSession.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.timerSessions = state.timerSessions.filter(
                    (session) => session._id !== action.payload
                );
                state.error = null;
                if (state.currentTimer && state.currentTimer._id === action.payload) {
                    state.currentTimer = null;
                }
            })
            .addCase(deleteTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentTimer, clearAllTimerSessions } = timerSlice.actions; 
export default timerSlice.reducer;