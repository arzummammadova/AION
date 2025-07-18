// src/types/index.ts

export interface TimerSession {
    _id: string;
    userId: string; // Yalnız timerSlice-də var, əlavə etsək yaxşı olar
    selectedDuration: number;
    startTime: string;
    endTime: string | null; // <-- Birləşdirilmiş tip
    elapsedTime: number;
    status: 'running' | 'paused' | 'stopped' | 'completed' | 'reset';
    pauseStartTime: string | null; // Yalnız timerSlice-də var, əlavə etsək yaxşı olar
    totalPausedTime: number;
    createdAt: string; // Yalnız timerSlice-də var, əlavə etsək yaxşı olar
    updatedAt: string; // Yalnız timerSlice-də var, əlavə etsək yaxşı olar
    name?: string;
    note?: string; // timerSlice-də startTimerSession və updateTimerSessionDetails-də istifadə olunur
}