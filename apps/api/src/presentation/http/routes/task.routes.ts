import { Router, Response, NextFunction } from 'express';
import { ValidationError } from '@personal-os/shared';
import {
  ICreateTaskUseCase,
  IUpdateTaskUseCase,
  IListTasksUseCase,
  IDeleteTaskUseCase
} from '../../../core/application/ports/in/task.use-cases.port.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { TaskStatus } from '@personal-os/types';

export function createTaskRoutes(
  createTaskUseCase: ICreateTaskUseCase,
  updateTaskUseCase: IUpdateTaskUseCase,
  listTasksUseCase: IListTasksUseCase,
  deleteTaskUseCase: IDeleteTaskUseCase
): Router {
  const router = Router();

  router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { title, description, projectId, priority, dueAt, estimatedDurationMinutes, cognitiveLoad, source } = req.body ?? {};
      if (!title) {
        throw new ValidationError('Task title is required');
      }
      const task = await createTaskUseCase.execute(userId, {
        title,
        description,
        projectId,
        priority,
        dueAt,
        estimatedDurationMinutes,
        cognitiveLoad,
        source
      });
      res.status(201).json({
        success: true,
        data: task,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { projectId, status, isOverdue } = req.query;
      const tasks = await listTasksUseCase.execute({
        userId,
        projectId: projectId as string | undefined,
        status: status as TaskStatus | undefined,
        isOverdue: isOverdue === 'true'
      });
      res.status(200).json({
        success: true,
        data: tasks,
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
      const updated = await updateTaskUseCase.execute(id, userId, req.body);
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
      await deleteTaskUseCase.execute(id, userId);
      res.status(200).json({
        success: true,
        data: { id, deleted: true },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
