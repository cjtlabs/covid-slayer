export const GameAction = {
  ATTACK: 'ATTACK',
  POWER_ATTACK: 'POWER_ATTACK',
  HEAL: 'HEAL',
  SURRENDER: 'SURRENDER'
} as const;

export const GameStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  PLAYER_WON: 'PLAYER_WON',
  PLAYER_LOST: 'PLAYER_LOST',
  DRAW: 'DRAW'
} as const;

export type ActionLog = {
  type: (typeof GameAction)[keyof typeof GameAction];
  timestamp: Date;
  playerDamage?: number;
  covidDamage?: number;
  healAmount?: number;
  description?: string;
}

export type GameResult = {
  status: (typeof GameStatus)[keyof typeof GameStatus];
  winner: 'player' | 'covid' | 'draw';
  finalPlayerHealth: number;
  finalCovidHealth: number;
  duration: number;
  totalActions: number;
}

export type Winner = 'player' | 'covid' | 'draw';
