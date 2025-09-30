import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/authSlice.ts';
import { gameReducer } from '../features/game/gameSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
