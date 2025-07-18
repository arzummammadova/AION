// src/redux/features/timerSlice.ts

import axiosInstance from '@/utils/axiosInstance';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { TimerSession } from '@/types'; // <-- Buradan idxal edin


// interface TimerSession {
//     _id: string;
//     userId: string;
//     selectedDuration: number;
//     startTime: string; 
//     // endTime: string | null;
//     endTime: string | null | undefined; // BURANI DƏYİŞDİRİN! Həm null, həm də undefined dəstəklənsin

//     elapsedTime: number;
//     status: 'running' | 'paused' | 'stopped' | 'completed' | 'reset'; 
//     pauseStartTime: string | null; 
//     totalPausedTime: number; 
//     createdAt: string;
//     updatedAt: string;
//     name?: string;
// }

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


export const startTimerSession = createAsyncThunk(
    'timer/startTimerSession',
    // Artıq `selectedDuration` ilə yanaşı `name` və `note` qəbul edirik
    async ({ selectedDuration, name, note }: { selectedDuration: number; name?: string; note?: string }, thunkAPI) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/start`,
                { selectedDuration, name, note }, // Backendə göndər
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

export const updateTimerSessionDetails = createAsyncThunk(
    'timer/updateTimerSessionDetails',
    async ({ timerId, name, note }: { timerId: string; name?: string; note?: string }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/timers/${timerId}/details`, // Backend route
                { name, note },
                { withCredentials: true }
            );
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Taymer məlumatları yenilənə bilmədi.');
        }
    }
);

export const updateTimerSession = createAsyncThunk(
    'timer/updateTimerSession',
    async (payload: { timerId: string; name: string }, { rejectWithValue }) => {
        try {
            // İndi axiosInstance istifadə edirik
            const response = await axiosInstance.put(`/timers/${payload.timerId}`, { name: payload.name });
            return response.data; // Yenilənmiş sessiyanı qaytarır
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
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

                // Yeni yaradılan taymerin adını düzgün şəkildə əlavə et
                // Siyahıda tapıb yeniləmək və ya yeni əlavə etmək məntiqi
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
            })
             .addCase(updateTimerSessionDetails.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateTimerSessionDetails.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                // currentTimer-ı yeniləyə bilərik, əgər redaktə olunan cari taymerdirsə
                if (state.currentTimer && state.currentTimer._id === (action.payload.timerSession?._id || action.payload._id)) {
                    state.currentTimer = action.payload.timerSession || action.payload;
                }
                // timerSessions siyahısında da yenilə
                const index = state.timerSessions.findIndex(
                    (session) => session._id === (action.payload.timerSession?._id || action.payload._id)
                );
                if (index !== -1) {
                    state.timerSessions[index] = action.payload.timerSession || action.payload;
                }
            })
            .addCase(updateTimerSessionDetails.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(updateTimerSession.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(updateTimerSession.fulfilled, (state, action: PayloadAction<TimerSession>) => {
                state.loading = 'succeeded';
                // Yenilənmiş sessiyanı `timerSessions` array-də tapıb yeniləyirik
                const index = state.timerSessions.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.timerSessions[index] = action.payload;
                }
                // Əgər yenilənən sessiya cari aktiv sessiyadırsa, `currentTimer`-i də yeniləyirik
                if (state.currentTimer && state.currentTimer._id === action.payload._id) {
                    state.currentTimer = action.payload;
                }
            })
            .addCase(updateTimerSession.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentTimer, clearAllTimerSessions } = timerSlice.actions; 
export default timerSlice.reducer;