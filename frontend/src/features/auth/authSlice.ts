import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  UserProfile,
} from '../../types/auth.ts';
import {
  loadAuthState,
  persistAuthState,
  clearAuthState,
} from '../../utils/storage.ts';
import {
  login,
  signup,
  fetchProfile,
} from '../../services/authService.ts';

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  profileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const persistedState = loadAuthState();

const initialState: AuthState = {
  user: persistedState?.user ?? null,
  token: persistedState?.token ?? null,
  status: 'idle',
  profileStatus: 'idle',
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const loginThunk = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await login(payload);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const signupThunk = createAsyncThunk<AuthResponse, SignupPayload, { rejectValue: string }>(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await signup(payload);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProfileThunk = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await fetchProfile();
      return profile;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.profileStatus = 'idle';
      state.error = null;
      clearAuthState();
    },
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      persistAuthState({ token: action.payload.token, user: action.payload.user });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuthState({ token: action.payload.token, user: action.payload.user });
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to login.';
      })
      .addCase(signupThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuthState({ token: action.payload.token, user: action.payload.user });
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to signup.';
      })
      .addCase(fetchProfileThunk.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.user = action.payload;
        if (state.token) {
          persistAuthState({ token: state.token, user: action.payload });
        }
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload ?? 'Unable to fetch profile.';
        if (action.payload?.includes('session has expired') || action.payload?.includes('Unauthorized')) {
          state.token = null;
          state.user = null;
          clearAuthState();
        }
      })
  },
});

export const { clearAuthError, logout, setCredentials } = slice.actions;
export const authReducer = slice.reducer;
