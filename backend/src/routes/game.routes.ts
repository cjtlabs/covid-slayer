import { Router } from 'express';
import { 
  startGameController,
  performActionController,
  getGameController,
  getGameHistoryController,
  getGameLogsController,
  getPlayerStatsController,
  getActiveGameController,
  forfeitGameController,
  updateTimerController
} from '../modules/game/game.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import {
  startGameSchema,
  performActionSchema,
  gameIdParamSchema,
  updateTimerSchema
} from '../schemas/game.schemas';

const router = Router();

router.post('/start', authenticateToken, validateSchema(startGameSchema), startGameController);

router.post('/:gameId/action', authenticateToken, validateSchema(performActionSchema), performActionController);

router.post('/:gameId/timer', authenticateToken, validateSchema(updateTimerSchema), updateTimerController);

router.get('/active', authenticateToken, getActiveGameController);

router.get('/history', authenticateToken, getGameHistoryController);

router.get('/stats', authenticateToken, getPlayerStatsController);

router.get('/:gameId', authenticateToken, validateSchema(gameIdParamSchema), getGameController);

router.get('/:gameId/logs', authenticateToken, validateSchema(gameIdParamSchema), getGameLogsController);

router.post('/forfeit', authenticateToken, forfeitGameController);

export default router;
