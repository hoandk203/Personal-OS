import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@personal-os/shared';
import { TokenServicePort } from '../../../core/application/ports/out/token-service.port.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function createAuthMiddleware(tokenService: TokenServicePort) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Missing or malformed Authorization header'));
    }

    const token = authHeader.substring(7);
    try {
      const payload = tokenService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };
}
