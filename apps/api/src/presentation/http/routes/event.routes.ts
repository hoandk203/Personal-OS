import { Router, Response, NextFunction } from 'express';
import { ValidationError } from '@personal-os/shared';
import { IIngestEventUseCase } from '../../../core/application/ports/in/event.use-cases.port.js';
import { EventRepositoryPort } from '../../../core/application/ports/out/event-repository.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export function createEventRoutes(
  ingestEventUseCase: IIngestEventUseCase,
  eventRepo: EventRepositoryPort
): Router {
  const router = Router();

  router.post('/ingest', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { type, source, sourceId, payload, occurredAt } = req.body ?? {};
      if (!type || !source || !sourceId) {
        throw new ValidationError('type, source, and sourceId are required');
      }
      const event = await ingestEventUseCase.execute(userId, { type, source, sourceId, payload: payload ?? {}, occurredAt });
      res.status(201).json({
        success: true,
        data: event,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/recent', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const events = await eventRepo.findRecentByUser(userId, limit);
      res.status(200).json({
        success: true,
        data: events,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
