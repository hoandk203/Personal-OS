import { Router, Request, Response, NextFunction } from 'express';
import { ValidationError } from '@personal-os/shared';
import { IRegisterUserUseCase, IAuthenticateUserUseCase } from '../../../core/application/ports/in/auth.use-cases.port.js';

export function createAuthRoutes(
  registerUseCase: IRegisterUserUseCase,
  authUseCase: IAuthenticateUserUseCase
): Router {
  const router = Router();

  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body ?? {};
      if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required');
      }
      const result = await registerUseCase.execute({ email, password, name });
      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }
      const result = await authUseCase.execute({ email, password });
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
