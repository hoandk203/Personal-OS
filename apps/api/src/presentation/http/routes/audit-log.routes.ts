import { Router, Response, NextFunction } from 'express';
import { IQueryAuditLogsUseCase } from '../../../core/application/ports/in/audit-log.use-cases.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ActorType } from '@personal-os/types';

export function createAuditLogRoutes(queryAuditLogsUseCase: IQueryAuditLogsUseCase): Router {
  const router = Router();

  router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { resource, actor, startDate, endDate, limit, offset } = req.query;

      const result = await queryAuditLogsUseCase.execute({
        userId,
        resource: resource as string | undefined,
        actor: actor as ActorType | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0
      });

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          limit: limit ? parseInt(limit as string, 10) : 50,
          offset: offset ? parseInt(offset as string, 10) : 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
