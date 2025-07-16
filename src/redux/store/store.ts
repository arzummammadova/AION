import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Reducer'lərinizi import edin
import userReducer from '../features/userSlice';
import trackReducer from '../features/trackSlice';
import timerReducer from '../features/timerSlice';
import themeReducer from '../features/themeSlice'; // Bu, isDarkMode state'inizi saxlayır

// Bütün reducer'ləri birləşdirin
const rootReducer = combineReducers({
    user: userReducer,
    timer: timerReducer,
    tracks: trackReducer,
    theme: themeReducer,
});

// `redux-persist` konfiqurasiyası
const persistConfig = {
    key: 'root', // localStorage'da state'i hansı açarla saxlayacaq
    storage, // Saxlama yeri (localStorage)
    whitelist: ['theme'], // Yalnız 'theme' state'ini yadda saxla
    // Əgər digər state'ləri də yadda saxlamaq istəyirsinizsə, buraya əlavə edin.
    // Məsələn: whitelist: ['theme', 'timer', 'user']
};

// Persisted reducer yaradın
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer, // Persisted reducer'i istifadə edin
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Redux serializable check xətasının qarşısını almaq üçün
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'timer/startTimerSession/fulfilled', 'timer/pauseTimerSession/fulfilled', 'timer/stopTimerSession/fulfilled', 'timer/completeTimerSession/fulfilled'], // Timer action'larını da əlavə edirik
            },
        }),
});

export const persistor = persistStore(store); // Persistor obyektini ixrac edin

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;