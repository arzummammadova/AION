import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface UserState {
  user: User | null;
  loading: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: 'idle',
  error: null,
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (_, thunkAPI) => {
  try {
    // Ensure credentials are included for sending cookies
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include',
    });

    if (!res.ok) {
      // If response is not OK, try to parse error message from response body
      const errorData = await res.json();
      throw new Error(errorData.message || 'İstifadəçi məlumatları yüklənə bilmədi');
    }
    return await res.json();
  } catch (err: any) {
    console.error("fetchUser error:", err);
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const logoutUser = createAsyncThunk('user/logoutUser', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Çıxış zamanı xəta baş verdi');
    }
    return; // No payload needed for logout success
  } catch (err: any) {
    console.error("logoutUser error:", err);
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const forgotPasswordUser = createAsyncThunk(
  'user/forgotPasswordUser',
  async (email: string, thunkAPI) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        email,
      });

      if (!res.data) throw new Error('İstifadəçi tapılmadı');

      return res.data; // əgər reducer-də istifadə olunacaqsa
    } catch (err: any) {
      console.error("forgotPasswordUser error:", err);
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const otpVerify = createAsyncThunk(
  'user/otpVerify',
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp-verify`, {
        email,
        otp,
      });
      return res.data;
    } catch (err: any) {
      console.error("otpVerify error:", err);
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'OTP yoxlanışı zamanı xəta baş verdi');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ email, password, confirmPassword }: { email: string; password: string; confirmPassword: string }, thunkAPI) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        email,
        password,
        confirmPassword,
      });
      // It's generally better to handle logout after successful password reset
      // in the component or a separate thunk, but keeping it here for now.
      await thunkAPI.dispatch(logoutUser());
      return res.data;
    } catch (err: any) {
      console.error("resetPassword error:", err);
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Şifrə sıfırlama zamanı xəta baş verdi.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = 'loading';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.user = null; // Clear user on failed fetch
        state.error = action.payload as string;
        console.error("Failed to fetch user:", action.payload); // Log error instead of alert
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = 'idle';
        state.error = null;
        console.log("User logged out successfully.");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        console.error("Logout failed:", action.payload);
      })
      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.error = null;
        // The user state might not be relevant here, as it's about initiating password reset
        console.log("Forgot password request successful:", action.payload.message);
        // You might want to show a success message to the user via a proper UI notification
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        console.error("Forgot password request failed:", action.payload);
      })
      .addCase(otpVerify.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(otpVerify.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = null; // User is not logged in after OTP verification
        state.error = null;
        console.log("OTP verification successful:", action.payload.message); // Log instead of alert
        // Consider dispatching a separate action to navigate to reset password page
      })
      .addCase(otpVerify.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        console.error("OTP verification failed:", action.payload); // Log instead of alert
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = null; // User is logged out after password reset
        state.error = null;
        console.log("Password reset successful:", action.payload.message); // Log instead of alert
        // You would typically redirect to the login page here in your component
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        console.error("Password reset failed:", action.payload); // Log instead of alert
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
