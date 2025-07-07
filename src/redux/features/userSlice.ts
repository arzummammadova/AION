import axios from 'axios'
// src/redux/features/userSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface User {
  _id: string
  username: string
  email: string
 
}

interface UserState {
  user: User | null
  loading: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserState = {
  user: null,
  loading: 'idle',
  error: null,
}


export const fetchUser = createAsyncThunk('user/fetchUser', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include',
    })

    if (!res.ok) throw new Error('İstifadəçi tapılmadı')
    return await res.json()
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message)
  }
})
export const logoutUser=createAsyncThunk('user/logoutUser', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('İstifadəçi tapılmadı')
    return
    
  } catch (err:any) {
    return thunkAPI.rejectWithValue(err.message)
  }
})


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
      // OTP uğurla təsdiqləndikdən sonra istifadəçini log in etmək və ya
      // yeni bir səhifəyə yönləndirmək üçün əlavə məntiq əlavə edə bilərsiniz.
      // Məsələn, dispatch(fetchUser()) və ya router.push('/reset-password').
      return res.data;
    } catch (err: any) {
      // Backend-dən gələn xəta mesajını istifadə et
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'OTP yoxlanışı zamanı xəta baş verdi');
    }
  }
);
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null
      state.loading = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = 'loading'
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.user = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.loading = 'idle'
        state.error = null
      })
      .addCase(forgotPasswordUser.fulfilled, (state) => {
        state.user = null
        state.loading = 'idle'
        state.error = null
        })
        .addCase(otpVerify.pending, (state) => {
          state.loading = 'loading';
          state.error = null; // Əvvəlki xətanı təmizlə
        })
        .addCase(otpVerify.fulfilled, (state, action) => {
          state.loading = 'succeeded';
          // OTP doğrulandıqdan sonra istifadəçi state-ini necə idarə etmək istədiyinizə bağlıdır.
          // Adətən, bu nöqtədə istifadəçinin şifrəsini sıfırlaması üçün bir addım gəlir.
          // `user` sahəsini boş qoymaq yerinə, məsələn, müvəqqəti token saxlaya bilərsiniz
          // və ya sadəcə doğrulamanın uğurlu olduğunu bildirin.
          // Hələ ki sizin kodunuzdakı kimi user: null qalsın.
          state.user = null;
          state.error = null;
          alert(action.payload.message); // Uğurlu mesajı göstər
        })
        .addCase(otpVerify.rejected, (state, action) => {
          state.loading = 'failed';
          state.error = action.payload as string;
          alert(action.payload as string); // Xəta mesajını göstər
        });
 

},
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
