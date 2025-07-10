// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/userSlice'
import timerReducer from '../features/timerSlice'
export const store = configureStore({
  reducer: {
     user: userReducer,
     timer: timerReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
