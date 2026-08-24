import { Router, Request, Response } from 'express';

export function createHealthRoutes(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'UP',
        service: 'personal-os-api',
        version: '0.1.0',
        timestamp: new Date().toISOString()
      }
    });
  });

  return router;
}
