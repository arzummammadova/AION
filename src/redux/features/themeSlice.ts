// src/redux/features/themeSlice.ts - Əvvəlki cavabdan götürülmüş və təsdiqlənmiş kod
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      return true;
    } else {
      document.documentElement.classList.remove('dark');
      return false;
    }
  }
  return false;
};

export interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  isDarkMode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => { // Bu action-u istifadə edəcəyik!
      state.isDarkMode = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        if (state.isDarkMode) {
          localStorage.setItem('theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          localStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action: PayloadAction<boolean>) => { // Bu action-u da istifadə edə bilərik
      state.isDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          localStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;