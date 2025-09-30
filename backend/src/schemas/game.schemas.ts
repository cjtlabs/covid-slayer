import { z } from 'zod';
import { GameAction } from '../modules/game/game.types';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid game ID');

export const startGameSchema = z.object({
  body: z.object({
    timer: z
      .number()
      .int('Timer must be an integer')
      .min(10, 'Timer must be at least 10 seconds')
      .max(300, 'Timer must not exceed 300 seconds')
      .optional()
      .default(60)
  })
});

export const performActionSchema = z.object({
  params: z.object({
    gameId: objectIdSchema
  }),
  body: z.object({
    action: z.enum(GameAction)
  })
});

export const gameIdParamSchema = z.object({
  params: z.object({
    gameId: objectIdSchema
  })
});

export const updateTimerSchema = z.object({
  params: z.object({
    gameId: objectIdSchema
  }),
  body: z
    .object({
      decrementBy: z.number().int('decrementBy must be an integer').min(1).max(60).optional()
    })
    .default({})
});

export type StartGameInput = z.infer<typeof startGameSchema>;
export type PerformActionInput = z.infer<typeof performActionSchema>;
export type GameIdParamInput = z.infer<typeof gameIdParamSchema>;
export type UpdateTimerInput = z.infer<typeof updateTimerSchema>;
