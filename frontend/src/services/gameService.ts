import type {
  StartGamePayload,
  PerformActionPayload,
  ActionLog,
  GameResult,
  GameStateSnapshot,
  PlayerStats,
  GameStatus
} from '../types/game.ts';
import { apiClient } from './httpClient.ts';

export const startGame = async (
  payload: StartGamePayload
): Promise<GameStateSnapshot> => {
  const { data } = await apiClient.post<{ success: boolean; game: GameStateSnapshot }>('/game/start', payload);
  return data.game;
};

export const performAction = async (
  payload: PerformActionPayload
): Promise<GameResult> => {
  const { data } = await apiClient.post<{ success: boolean; result: GameResult }>(`/game/${payload.gameId}/action`, {
    action: payload.action,
  });
  return data.result;
};

export const getActiveGame = async (): Promise<GameStateSnapshot | null> => {
  const { data } = await apiClient.get<{ success: boolean; activeGame: GameStateSnapshot | null }>('/game/active');
  return data.activeGame;
};

export const getGameHistory = async (): Promise<GameStateSnapshot[]> => {
  const { data } = await apiClient.get<{ success: boolean; games: GameStateSnapshot[] }>('/game/history');
  return data.games || [];
};

export const getPlayerStats = async (): Promise<PlayerStats> => {
  const { data } = await apiClient.get<{ success: boolean; stats: PlayerStats }>('/game/stats');
  return data.stats;
};

export const getGameLogs = async (gameId: string): Promise<ActionLog[]> => {
  const { data } = await apiClient.get<{ success: boolean; logs: ActionLog[] }>(`/game/${gameId}/logs`);
  return data.logs || [];
};

export const getGameById = async (gameId: string): Promise<GameStateSnapshot> => {
  const { data } = await apiClient.get<{ success: boolean; game: GameStateSnapshot }>(`/game/${gameId}`);
  return data.game;
};

export const forfeitActiveGames = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>('/game/forfeit');
  return data;
};

export const tickTimer = async (
  gameId: string,
  decrementBy: number = 1
): Promise<{ timer: number; status: GameStatus | string; winner?: 'player' | 'covid' | 'draw'; gameEnded: boolean }> => {
  const { data } = await apiClient.post<{
    success: boolean;
    timer: number;
    status: GameStatus | string;
    winner?: 'player' | 'covid' | 'draw';
    gameEnded: boolean;
  }>(`/game/${gameId}/timer`, { decrementBy });
  return {
    timer: data.timer,
    status: data.status,
    winner: data.winner,
    gameEnded: data.gameEnded,
  };
};
