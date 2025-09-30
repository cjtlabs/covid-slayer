import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CharacterKey } from './characters.ts';
import { getOppositeCharacter } from './characters.ts';
import type {
  ActionLog,
  GameResult,
  GameStateSnapshot,
  GameStatus,
  PlayerStats,
} from '../../types/game.ts';
import {
  forfeitActiveGames,
  getActiveGame,
  getGameById,
  getGameHistory,
  getGameLogs,
  getPlayerStats,
  performAction,
  startGame,
  tickTimer,
} from '../../services/gameService.ts';
import type { GameActionType } from '../../types/game.ts';

type StartGameArgs = {
  timer?: number;
}
type PerformActionArgs = {
  gameId: string;
  action: GameActionType;
}
type GameState = {
  activeGame: GameStateSnapshot | null;
  history: GameStateSnapshot[];
  stats: PlayerStats | null;
  logs: ActionLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  logsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastResult: GameResult | null;
  playerCharacter: CharacterKey;
  enemyCharacter: CharacterKey;
}

const initialState: GameState = {
  activeGame: null,
  history: [],
  stats: null,
  logs: [],
  status: 'idle',
  logsStatus: 'idle',
  error: null,
  lastResult: null,
  playerCharacter: 'slayer',
  enemyCharacter: 'monster',
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

export const startGameThunk = createAsyncThunk<
  GameStateSnapshot,
  StartGameArgs | undefined,
  { rejectValue: string }
>('game/start', async (payload, { rejectWithValue }) => {
  try {
    const response = await startGame(payload ?? {});
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const tickTimerThunk = createAsyncThunk<
  { timer: number; status: GameStatus | string; winner?: 'player' | 'covid' | 'draw'; gameEnded: boolean },
  { gameId: string; decrementBy?: number },
  { rejectValue: string }
>('game/tick', async ({ gameId, decrementBy = 1 }, { rejectWithValue }) => {
  try {
    const response = await tickTimer(gameId, decrementBy);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const performActionThunk = createAsyncThunk<
  GameResult,
  PerformActionArgs,
  { rejectValue: string }
>('game/action', async (payload, { rejectWithValue }) => {
  try {
    const response = await performAction(payload);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchActiveGameThunk = createAsyncThunk<
  GameStateSnapshot | null,
  void,
  { rejectValue: string }
>('game/active', async (_, { rejectWithValue }) => {
  try {
    const response = await getActiveGame();
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchGameHistoryThunk = createAsyncThunk<
  GameStateSnapshot[],
  void,
  { rejectValue: string }
>('game/history', async (_, { rejectWithValue }) => {
  try {
    const response = await getGameHistory();
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchPlayerStatsThunk = createAsyncThunk<
  PlayerStats,
  void,
  { rejectValue: string }
>('game/stats', async (_, { rejectWithValue }) => {
  try {
    const response = await getPlayerStats();
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchGameLogsThunk = createAsyncThunk<
  ActionLog[],
  string,
  { rejectValue: string }
>('game/logs', async (gameId, { rejectWithValue }) => {
  try {
    const response = await getGameLogs(gameId);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const refreshGameByIdThunk = createAsyncThunk<
  GameStateSnapshot,
  string,
  { rejectValue: string }
>('game/byId', async (gameId, { rejectWithValue }) => {
  try {
    const response = await getGameById(gameId);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const forfeitActiveGamesThunk = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>('game/forfeit', async (_, { rejectWithValue }) => {
  try {
    const response = await forfeitActiveGames();
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const slice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    clearGameError(state) {
      state.error = null;
    },
    resetGameState(state) {
      state.activeGame = null;
      state.logs = [];
      state.lastResult = null;
      state.status = 'idle';
      state.logsStatus = 'idle';
      state.error = null;
    },
    setActiveGame(state, action: PayloadAction<GameStateSnapshot | null>) {
      state.activeGame = action.payload;
    },
    setGameStatus(state, action: PayloadAction<GameStatus>) {
      if (state.activeGame) {
        state.activeGame = { ...state.activeGame, status: action.payload };
      }
    },
    setPlayerCharacter(state, action: PayloadAction<CharacterKey>) {
      state.playerCharacter = action.payload;
      state.enemyCharacter = getOppositeCharacter(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startGameThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(startGameThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeGame = action.payload;
        state.logs = action.payload.actions ?? [];
        state.lastResult = null;
      })
      .addCase(startGameThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to start game.';
      })
      .addCase(performActionThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(performActionThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastResult = action.payload;
        if (state.activeGame) {
          state.activeGame = {
            ...state.activeGame,
            playerHealth: action.payload.playerHealth,
            covidHealth: action.payload.covidHealth,
            status: action.payload.status,
            winner: action.payload.winner,
            actions: [
              ...(state.activeGame.actions ?? []),
              action.payload.lastAction,
            ],
          };
          // If game ended, clear it from active game after a short delay
          if (action.payload.gameEnded || action.payload.status !== 'IN_PROGRESS') {
            // We'll let the UI show the result, the user can start a new game
          }
        }
        state.logs = [action.payload.lastAction, ...state.logs].slice(0, 50);
      })
      .addCase(performActionThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to perform action.';
      })
      .addCase(fetchActiveGameThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActiveGameThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeGame = action.payload;
        state.logs = action.payload?.actions ?? [];
      })
      .addCase(fetchActiveGameThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load active game.';
      })
      .addCase(fetchGameHistoryThunk.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(fetchGameHistoryThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Unable to fetch game history.';
      })
      .addCase(fetchPlayerStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchPlayerStatsThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Unable to load player stats.';
      })
      .addCase(fetchGameLogsThunk.pending, (state) => {
        state.logsStatus = 'loading';
      })
      .addCase(fetchGameLogsThunk.fulfilled, (state, action) => {
        state.logsStatus = 'succeeded';
        state.logs = action.payload;
      })
      .addCase(fetchGameLogsThunk.rejected, (state, action) => {
        state.logsStatus = 'failed';
        state.error = action.payload ?? 'Unable to load game logs.';
      })
      .addCase(refreshGameByIdThunk.fulfilled, (state, action) => {
        state.activeGame = action.payload;
        state.logs = action.payload.actions ?? [];
      })
      .addCase(tickTimerThunk.fulfilled, (state, action) => {
        if (state.activeGame) {
          state.activeGame = {
            ...state.activeGame,
            timer: action.payload.timer,
            status: (action.payload.status as GameStatus) ?? state.activeGame.status,
            winner: action.payload.winner ?? state.activeGame.winner,
          };
        }
      })
      .addCase(tickTimerThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Unable to update timer.';
      })
      .addCase(forfeitActiveGamesThunk.fulfilled, (state) => {
        state.activeGame = null;
        state.logs = [];
      })
      .addCase(forfeitActiveGamesThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Unable to forfeit games.';
      });
  },
});

export const { clearGameError, resetGameState, setActiveGame, setGameStatus, setPlayerCharacter } = slice.actions;
export const gameReducer = slice.reducer;
