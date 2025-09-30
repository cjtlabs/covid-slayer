export const GAME_ACTIONS = {
  ATTACK: 'ATTACK',
  POWER_ATTACK: 'POWER_ATTACK',
  HEAL: 'HEAL',
  SURRENDER: 'SURRENDER',
} as const;

export type GameActionType = (typeof GAME_ACTIONS)[keyof typeof GAME_ACTIONS];

export const GAME_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  PLAYER_WON: 'PLAYER_WON',
  PLAYER_LOST: 'PLAYER_LOST',
  DRAW: 'DRAW',
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export type StartGamePayload = {
  timer?: number;
}

export type PerformActionPayload = {
  gameId: string;
  action: GameActionType;
}

export type ActionLog ={
  type: GameActionType;
  timestamp: string;
  description?: string;
  playerDamage?: number;
  covidDamage?: number;
  healAmount?: number;
}

export type GameStateSnapshot = {
  id: string;
  _id?: string;
  playerId?: string;
  playerHealth: number;
  covidHealth: number;
  timer?: number;
  status: GameStatus;
  actions?: ActionLog[];
  winner?: 'player' | 'covid' | 'draw';
  startedAt: string;
  endedAt?: string;
  duration?: number | null;
  actionsCount?: number;
}

export type GameResult = {
  playerHealth: number;
  covidHealth: number;
  status: GameStatus;
  winner?: 'player' | 'covid' | 'draw';
  lastAction: ActionLog;
  gameEnded: boolean;
}

export type PlayerStats = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  surrenders: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  averageGameDuration: number;
  winRate: number;
}
