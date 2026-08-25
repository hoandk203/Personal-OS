import { describe, it, expect, beforeEach } from 'vitest';
import {
  ListProjectsUseCase,
  GetProjectByIdUseCase,
  DeleteProjectUseCase
} from '../../../src/core/application/use-cases/projects/create-project.use-case.js';
import { CalculateProjectHealthUseCase } from '../../../src/core/application/use-cases/projects/calculate-project-health.use-case.js';
import { InMemoryProjectRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-project.repository.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { ProjectEntity } from '../../../src/core/domain/entities/project.entity.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { ProjectStatus, TaskStatus, Priority } from '@personal-os/types';
import { NotFoundError } from '@personal-os/shared';

describe('Project Expansion & Detailed Health Breakdown Test Suite', () => {
  let projectRepo: InMemoryProjectRepository;
  let taskRepo: InMemoryTaskRepository;

  beforeEach(() => {
    projectRepo = new InMemoryProjectRepository();
    taskRepo = new InMemoryTaskRepository();
  });

  describe('List, Get, Delete Projects', () => {
    it('should list projects with filter, get by id, and delete', async () => {
      const p1 = new ProjectEntity('p-1', 'u-1', 'Active Proj', null, ProjectStatus.ACTIVE);
      const p2 = new ProjectEntity('p-2', 'u-1', 'Paused Proj', null, ProjectStatus.PAUSED);
      await projectRepo.save(p1);
      await projectRepo.save(p2);

      const listUseCase = new ListProjectsUseCase(projectRepo);
      const getUseCase = new GetProjectByIdUseCase(projectRepo);
      const deleteUseCase = new DeleteProjectUseCase(projectRepo);

      const all = await listUseCase.execute('u-1');
      expect(all.length).toBe(2);

      const activeOnly = await listUseCase.execute('u-1', ProjectStatus.ACTIVE);
      expect(activeOnly.length).toBe(1);

      const single = await getUseCase.execute('p-1', 'u-1');
      expect(single.name).toBe('Active Proj');

      await expect(getUseCase.execute('non-existent', 'u-1')).rejects.toThrow(NotFoundError);

      const deleted = await deleteUseCase.execute('p-1', 'u-1');
      expect(deleted).toBe(true);
    });
  });

  describe('CalculateProjectHealthUseCase Breakdown & Risk Scenarios', () => {
    it('should compute health with overdue deadline, blocked tasks, and active tasks', async () => {
      const overdueDeadline = new Date(Date.now() - 86400000); // 1 day past
      const project = new ProjectEntity('p-risk', 'u-1', 'Risky Proj', null, ProjectStatus.ACTIVE, overdueDeadline);
      await projectRepo.save(project);

      // Add blocked & overdue tasks
      await taskRepo.save(new TaskEntity('t-b1', 'u-1', 'p-risk', 'Blocked item', null, TaskStatus.BLOCKED, Priority.HIGH));
      await taskRepo.save(new TaskEntity('t-o1', 'u-1', 'p-risk', 'Overdue item', null, TaskStatus.IN_PROGRESS, Priority.URGENT, overdueDeadline));

      const healthUseCase = new CalculateProjectHealthUseCase(projectRepo, taskRepo);
      const health = await healthUseCase.execute('p-risk', 'u-1');

      expect(health.scheduleRiskScore).toBe(100);
      expect(health.blockerRiskScore).toBeGreaterThan(50);
      expect(health.breakdown?.blockedTasks).toBe(1);
      expect(health.breakdown?.overdueTasks).toBe(1);
    });

    it('should compute schedule risk for deadline in 2 days and 5 days', async () => {
      const deadline2Days = new Date(Date.now() + 2 * 86400000);
      const p2 = new ProjectEntity('p-2d', 'u-1', 'Tight Deadline Proj', null, ProjectStatus.ACTIVE, deadline2Days);
      await projectRepo.save(p2);

      const healthUseCase = new CalculateProjectHealthUseCase(projectRepo, taskRepo);
      const h2 = await healthUseCase.execute('p-2d', 'u-1');
      expect(h2.scheduleRiskScore).toBe(85);

      const deadline5Days = new Date(Date.now() + 5 * 86400000);
      const p5 = new ProjectEntity('p-5d', 'u-1', 'Medium Deadline Proj', null, ProjectStatus.ACTIVE, deadline5Days);
      await projectRepo.save(p5);

      const h5 = await healthUseCase.execute('p-5d', 'u-1');
      expect(h5.scheduleRiskScore).toBe(60);
    });
  });
});
