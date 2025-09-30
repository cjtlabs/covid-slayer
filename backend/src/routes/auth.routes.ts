import { Router } from 'express';
import { 
  signupController, 
  loginController,
  getProfileController,
} from '../modules/auth/auth.controller';
import { validateSchema } from '../middleware/validation.middleware';
import {
  signupSchema,
  loginSchema,
} from '../schemas/auth.schemas';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', validateSchema(signupSchema), signupController);

router.post('/login', validateSchema(loginSchema), loginController);

router.get('/profile', authenticateToken, getProfileController);

export default router;
