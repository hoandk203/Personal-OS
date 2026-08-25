import { Router, Response, NextFunction } from 'express';
import { ValidationError } from '@personal-os/shared';
import {
  ISetDailyFocusUseCase,
  IGetDailyFocusUseCase,
  IToggleDailyFocusTaskUseCase,
  IGetDailyScheduleUseCase,
  IGetActivityTimelineUseCase
} from '../../../core/application/ports/in/today.use-cases.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export function createTodayRoutes(
  setDailyFocusUseCase: ISetDailyFocusUseCase,
  getDailyFocusUseCase: IGetDailyFocusUseCase,
  toggleDailyFocusTaskUseCase: IToggleDailyFocusTaskUseCase,
  getDailyScheduleUseCase: IGetDailyScheduleUseCase,
  getActivityTimelineUseCase: IGetActivityTimelineUseCase
): Router {
  const router = Router();

  // GET /api/v1/today/focus
  router.get('/focus', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { date } = req.query;
      const result = await getDailyFocusUseCase.execute(userId, date as string | undefined);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/today/focus
  router.post('/focus', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskIds, date } = req.body ?? {};
      if (!Array.isArray(taskIds)) {
        throw new ValidationError('taskIds array is required');
      }
      const result = await setDailyFocusUseCase.execute(userId, date as string, taskIds);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/today/focus/toggle
  router.post('/focus/toggle', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskId, date } = req.body ?? {};
      if (!taskId) {
        throw new ValidationError('taskId is required');
      }
      const result = await toggleDailyFocusTaskUseCase.execute(userId, taskId, date as string | undefined);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/today/schedule
  router.get('/schedule', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { date } = req.query;
      const result = await getDailyScheduleUseCase.execute(userId, date as string | undefined);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/today/timeline
  router.get('/timeline', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { limit } = req.query;
      const result = await getActivityTimelineUseCase.execute(userId, limit ? Number(limit) : 20);
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
