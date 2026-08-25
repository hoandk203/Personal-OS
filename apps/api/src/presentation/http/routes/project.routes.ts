import { Router, Response, NextFunction } from 'express';
import { ValidationError } from '@personal-os/shared';
import {
  ICreateProjectUseCase,
  IUpdateProjectUseCase,
  ICalculateProjectHealthUseCase
} from '../../../core/application/ports/in/project.use-cases.port.js';
import { ProjectRepositoryPort } from '../../../core/application/ports/out/project-repository.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export function createProjectRoutes(
  createProjectUseCase: ICreateProjectUseCase,
  updateProjectUseCase: IUpdateProjectUseCase,
  calculateHealthUseCase: ICalculateProjectHealthUseCase,
  projectRepo: ProjectRepositoryPort
): Router {
  const router = Router();

  router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, description, deadline, tags } = req.body ?? {};
      if (!name) {
        throw new ValidationError('Project name is required');
      }
      const project = await createProjectUseCase.execute(userId, { name, description, deadline, tags });
      res.status(201).json({
        success: true,
        data: project,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;
      const projects = await projectRepo.findMany(userId, status as any);
      res.status(200).json({
        success: true,
        data: projects,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const updated = await updateProjectUseCase.execute(id, userId, req.body);
      res.status(200).json({
        success: true,
        data: updated,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const deleted = await projectRepo.delete(id, userId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          statusCode: 404,
          error: 'NOT_FOUND',
          message: `Project with id '${id}' not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: { id, deleted: true },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const project = await projectRepo.findById(id, userId);
      if (!project) {
        res.status(404).json({
          success: false,
          statusCode: 404,
          error: 'NOT_FOUND',
          message: `Project with id '${id}' not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: project,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/calculate-health', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const health = await calculateHealthUseCase.execute(id, userId);
      res.status(200).json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
