import { Game, TGame } from '../../models/game.model';
import { GameAction, GameStatus, ActionLog, Winner } from './game.types';
import { checkGameEnd, getPlayerGameHistory } from './game.helpers'

export async function createGameService(playerId: string, timer: number = 60): Promise<TGame> {
  const game = new Game({
    playerId,
    playerHealth: 100,
    covidHealth: 100,
    timer,
    status: GameStatus.IN_PROGRESS,
    actions: [],
    startedAt: new Date()
  });

  await game.save();
  return game;
};

export async function performActionService(gameId: string, action: (typeof GameAction)[keyof typeof GameAction]): Promise<{
  playerHealth: number;
  covidHealth: number;
  status: (typeof GameStatus)[keyof typeof GameStatus];
  winner?: Winner;
  lastAction: ActionLog;
  gameEnded: boolean;
}> {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new Error('Game has already ended');
  }

  const actionLog: ActionLog = {
    type: action,
    timestamp: new Date()
  };

  switch (action) {
    case GameAction.ATTACK: {
      const attackPlayerDamage = Math.floor(Math.random() * 11);
      const attackCovidDamage = Math.floor(Math.random() * 11);

      game.playerHealth = Math.max(0, game.playerHealth - attackCovidDamage);
      game.covidHealth = Math.max(0, game.covidHealth - attackPlayerDamage);

      actionLog.playerDamage = attackCovidDamage;
      actionLog.covidDamage = attackPlayerDamage;
      actionLog.description = `Player dealt ${attackPlayerDamage} damage, Covid dealt ${attackCovidDamage} damage`;
      break;
    }
    case GameAction.POWER_ATTACK: {
      const powerPlayerDamage = Math.floor(Math.random() * 21);
      const powerCovidDamage = Math.floor(Math.random() * 21);

      game.playerHealth = Math.max(0, game.playerHealth - powerCovidDamage);
      game.covidHealth = Math.max(0, game.covidHealth - powerPlayerDamage);

      actionLog.playerDamage = powerCovidDamage;
      actionLog.covidDamage = powerPlayerDamage;
      actionLog.description = `Player dealt ${powerPlayerDamage} power damage, Covid dealt ${powerCovidDamage} power damage`;
      break;
    }
    case GameAction.HEAL: {
      const healAmount = Math.floor(Math.random() * 21);
      const healCovidDamage = Math.floor(Math.random() * 11);

      game.playerHealth = Math.min(100, game.playerHealth + healAmount - healCovidDamage);

      actionLog.healAmount = healAmount;
      actionLog.playerDamage = healCovidDamage;
      actionLog.description = `Player healed ${healAmount} HP but took ${healCovidDamage} damage`;
      break;
    }
    case GameAction.SURRENDER: {
      game.status = GameStatus.PLAYER_LOST;
      game.winner = 'covid';
      game.endedAt = new Date();
      actionLog.description = 'Player surrendered';
      break;
    }
  }

  game.actions.push(actionLog);

  if (action !== GameAction.SURRENDER) {
    const gameEnd = await checkGameEnd(game);
    if (gameEnd.status !== GameStatus.IN_PROGRESS) {
      game.status = gameEnd.status;
      game.winner = gameEnd.winner;
      game.endedAt = new Date();
    }
  }

  await game.save();

  return {
    playerHealth: game.playerHealth,
    covidHealth: game.covidHealth,
    status: game.status,
    winner: game.winner,
    lastAction: actionLog,
    gameEnded: game.status !== GameStatus.IN_PROGRESS
  };
};

export async function getGameByIdService(gameId: string): Promise<TGame | null> {
  return Game.findById(gameId);
}

export async function updateTimerService(gameId: string, decrementBy: number = 1): Promise<{
  timer: number;
  status: (typeof GameStatus)[keyof typeof GameStatus];
  winner?: Winner;
  gameEnded: boolean;
}> {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new Error('Game has already ended');
  }

  game.timer = Math.max(0, game.timer - decrementBy);

  if (game.timer === 0) {
    const gameEnd = await checkGameEnd(game);
    game.status = gameEnd.status;
    game.winner = gameEnd.winner;
    game.endedAt = new Date();
  }

  await game.save();

  return {
    timer: game.timer,
    status: game.status,
    winner: game.winner,
    gameEnded: game.status !== GameStatus.IN_PROGRESS
  };
};

export async function getGameLogsService(gameId: string): Promise<ActionLog[]> {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  return game.actions;
};

export async function getPlayerStatsService(playerId: string): Promise<any> {
  const games = await getPlayerGameHistory(playerId);

  const stats = {
    totalGames: games.length,
    wins: 0,
    losses: 0,
    draws: 0,
    surrenders: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalHealing: 0,
    averageGameDuration: 0,
    winRate: 0
  };

  if (games.length === 0) {
    return stats;
  }

  let totalDuration = 0;

  for (const game of games) {
    if (game.status === GameStatus.PLAYER_WON) stats.wins++;
    else if (game.status === GameStatus.PLAYER_LOST) stats.losses++;
    else if (game.status === GameStatus.DRAW) stats.draws++;

    const surrenderAction = game.actions.find(a => a.type === GameAction.SURRENDER);
    if (surrenderAction) stats.surrenders++;

    for (const action of game.actions) {
      if (action.covidDamage) stats.totalDamageDealt += action.covidDamage;
      if (action.playerDamage) stats.totalDamageTaken += action.playerDamage;
      if (action.healAmount) stats.totalHealing += action.healAmount;
    }

    if (game.endedAt) {
      totalDuration += (game.endedAt.getTime() - game.startedAt.getTime()) / 1000;
    }
  }

  stats.averageGameDuration = Math.round(totalDuration / games.length);
  stats.winRate = Math.round((stats.wins / games.length) * 100);

  return stats;
};

export async function getActiveGameService(playerId: string): Promise<TGame | null> {
  return Game.findOne({ playerId, status: GameStatus.IN_PROGRESS });
};

export async function forfeitActiveGamesService(playerId: string): Promise<void> {
  const activeGames = await Game.find({ playerId, status: GameStatus.IN_PROGRESS });

  for (const game of activeGames) {
    game.status = GameStatus.PLAYER_LOST;
    game.winner = 'covid';
    game.endedAt = new Date();
    game.actions.push({
      type: GameAction.SURRENDER,
      timestamp: new Date(),
      description: 'Player forfeited the game'
    });
    await game.save();
  }
};
