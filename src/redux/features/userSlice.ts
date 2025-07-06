// src/redux/features/userSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface User {
  _id: string
  username: string
  email: string
  // başqa lazım olan sahələr
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

// 🟡 Thunk: Me endpointindən istifadəçi məlumatı gətir
export const fetchUser = createAsyncThunk('user/fetchUser', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: 'include', // <-- vacib
    })

    if (!res.ok) throw new Error('İstifadəçi tapılmadı')
    return await res.json()
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message)
  }
})


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
  },
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
