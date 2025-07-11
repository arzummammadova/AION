// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/userSlice'
import trackReducer from '../features/trackSlice'
import timerReducer from '../features/timerSlice'
export const store = configureStore({
  reducer: {
     user: userReducer,
     timer: timerReducer,
     tracks: trackReducer, // <-- BURAYA DİQQƏT EDİN: Key adı `tracks` olmalıdır.
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
