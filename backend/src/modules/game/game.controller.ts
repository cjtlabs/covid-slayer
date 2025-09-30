import { Response } from 'express';
import { GameAction } from './game.types';
import { AuthenticatedRequest } from '../auth/auth.types';
import { getActiveGameService, getGameByIdService, updateTimerService, performActionService, createGameService, getGameLogsService, forfeitActiveGamesService, getPlayerStatsService } from './game.service';
import { getPlayerGameHistory } from './game.helpers';

export const startGameController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { timer } = req.body;
    const gameTimer = timer && typeof timer === 'number' && timer > 0 ? timer : 60;

    const activeGame = await getActiveGameService(userId);
    if (activeGame) {
      res.status(400).json({
        success: false,
        error: 'You already have an active game',
        gameId: activeGame._id
      });
      return;
    }

    const game = await createGameService(userId, gameTimer);

    res.status(201).json({
      success: true,
      message: 'Game started successfully',
      game: {
        id: game._id,
        playerHealth: game.playerHealth,
        covidHealth: game.covidHealth,
        timer: game.timer,
        status: game.status,
        startedAt: game.startedAt
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start game';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const updateTimerController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { gameId } = req.params;
    const decrementBy = typeof req.body?.decrementBy === 'number' && req.body.decrementBy > 0 ? req.body.decrementBy : 1;

    // Verify ownership
    const game = await getGameByIdService(gameId);
    if (!game) {
      res.status(404).json({ success: false, error: 'Game not found' });
      return;
    }
    if (game.playerId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const result = await updateTimerService(gameId, decrementBy);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update timer';
    res.status(500).json({ success: false, error: message });
  }
};

export const performActionController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { gameId } = req.params;
    const { action } = req.body;

    // Validate action
    if (!Object.values(GameAction).includes(action)) {
      res.status(400).json({
        success: false,
        error: 'Invalid action',
        validActions: Object.values(GameAction)
      });
      return;
    }

    // Verify game belongs to user
    const game = await getGameByIdService(gameId);
    if (!game) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    if (game.playerId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    // Perform action
    const result = await performActionService(gameId, action);

    res.status(200).json({
      success: true,
      message: `Action ${action} performed successfully`,
      result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to perform action';
    const status = message.includes('not found') ? 404 : 
                  message.includes('already ended') ? 400 : 500;
    
    res.status(status).json({
      success: false,
      error: message
    });
  }
};

export const getGameController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { gameId } = req.params;
    const game = await getGameByIdService(gameId);

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    // Check if user owns this game
    if (game.playerId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    res.status(200).json({
      success: true,
      game: {
        id: game._id,
        playerHealth: game.playerHealth,
        covidHealth: game.covidHealth,
        timer: game.timer,
        status: game.status,
        winner: game.winner,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        actions: game.actions
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get game';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const getGameHistoryController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const games = await getPlayerGameHistory(userId);

    res.status(200).json({
      success: true,
      games: games.map(game => ({
        id: game._id,
        playerHealth: game.playerHealth,
        covidHealth: game.covidHealth,
        status: game.status,
        winner: game.winner,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        duration: game.endedAt ? 
          Math.floor((game.endedAt.getTime() - game.startedAt.getTime()) / 1000) : 
          null,
        actionsCount: game.actions.length
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get game history';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const getGameLogsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const { gameId } = req.params;
    
    // Verify game exists and belongs to user
    const game = await getGameByIdService(gameId);
    if (!game) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    if (game.playerId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    const logs = await getGameLogsService(gameId);

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get game logs';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const getPlayerStatsController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const stats = await getPlayerStatsService(userId);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get player stats';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const getActiveGameController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    const activeGame = await getActiveGameService(userId);

    if (!activeGame) {
      res.status(200).json({
        success: true,
        activeGame: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      activeGame: {
        id: activeGame._id,
        playerHealth: activeGame.playerHealth,
        covidHealth: activeGame.covidHealth,
        timer: activeGame.timer,
        status: activeGame.status,
        startedAt: activeGame.startedAt,
        actions: activeGame.actions
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get active game';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};

export const forfeitGameController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
      return;
    }

    await forfeitActiveGamesService(userId);

    res.status(200).json({
      success: true,
      message: 'All active games forfeited'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to forfeit games';
    res.status(500).json({
      success: false,
      error: message
    });
  }
};
