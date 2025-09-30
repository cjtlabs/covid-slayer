import { Response } from 'express';
import { signupService, loginService, getUserByIdService } from './auth.service';
import { AuthenticatedRequest } from './auth.types';

export const signupController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { fullname, email, password, avatar } = req.body;
      if (!fullname || !email || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      const result = await signupService({
        fullname,
        email,
        password,
        avatar
      });

      res.status(201).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: message
      });
    }
  };

export const loginController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      const result = await loginService(email, password);

      res.status(200).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const status = message === 'Invalid credentials' ? 401 : 400;
      
      res.status(status).json({
        success: false,
        error: message
      });
    }
  };

export const getProfileController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      const user = await getUserByIdService(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
      res.status(500).json({
        success: false,
        error: message
      });
    }
  };