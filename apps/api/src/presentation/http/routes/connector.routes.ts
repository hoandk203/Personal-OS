import { Router, Response, NextFunction } from 'express';
import {
  ISyncGitHubActivityUseCase,
  ISyncCalendarScheduleUseCase
} from '../../../core/application/ports/in/connector.use-cases.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export function createConnectorRoutes(
  syncGitHubUseCase: ISyncGitHubActivityUseCase,
  syncCalendarUseCase: ISyncCalendarScheduleUseCase
): Router {
  const router = Router();

  // POST /api/v1/connectors/github/sync
  router.post('/github/sync', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { mockFallback, token } = req.body ?? {};
      const result = await syncGitHubUseCase.execute(userId, { mockFallback, token });
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/connectors/calendar/sync
  router.post('/calendar/sync', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { date, mockFallback, token } = req.body ?? {};
      const result = await syncCalendarUseCase.execute(userId, date, { mockFallback, token });
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
