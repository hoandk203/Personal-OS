import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProjectUseCase, UpdateProjectUseCase } from '../../../src/core/application/use-cases/projects/create-project.use-case.js';
import { CalculateProjectHealthUseCase } from '../../../src/core/application/use-cases/projects/calculate-project-health.use-case.js';
import { CreateTaskUseCase } from '../../../src/core/application/use-cases/tasks/create-task.use-case.js';
import { UpdateTaskUseCase } from '../../../src/core/application/use-cases/tasks/update-task.use-case.js';
import { InMemoryProjectRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-project.repository.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { EventEmitterBusAdapter } from '../../../src/infrastructure/events/event-emitter-bus.adapter.js';
import { ProjectStatus, TaskStatus } from '@personal-os/types';
import { NotFoundError } from '@personal-os/shared';

describe('Project Use Cases Suite', () => {
  let projectRepo: InMemoryProjectRepository;
  let taskRepo: InMemoryTaskRepository;
  let eventBus: EventEmitterBusAdapter;
  let createProjectUseCase: CreateProjectUseCase;
  let updateProjectUseCase: UpdateProjectUseCase;
  let calculateHealthUseCase: CalculateProjectHealthUseCase;
  let createTaskUseCase: CreateTaskUseCase;
  let updateTaskUseCase: UpdateTaskUseCase;

  beforeEach(() => {
    projectRepo = new InMemoryProjectRepository();
    taskRepo = new InMemoryTaskRepository();
    eventBus = new EventEmitterBusAdapter();
    createProjectUseCase = new CreateProjectUseCase(projectRepo, eventBus);
    updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
    calculateHealthUseCase = new CalculateProjectHealthUseCase(projectRepo, taskRepo);
    createTaskUseCase = new CreateTaskUseCase(taskRepo, eventBus);
    updateTaskUseCase = new UpdateTaskUseCase(taskRepo, eventBus);
  });

  it('should create and update a project with events', async () => {
    let capturedEvent: any = null;
    eventBus.subscribe('project.created', (event) => {
      capturedEvent = event;
    });

    const project = await createProjectUseCase.execute('user-1', {
      name: 'Personal OS Core',
      description: 'Building phase 0 foundation',
      tags: ['typescript', 'clean-arch']
    });

    expect(project.id).toBeDefined();
    expect(project.status).toBe(ProjectStatus.ACTIVE);
    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent.name).toBe('Personal OS Core');

    const updated = await updateProjectUseCase.execute(project.id, 'user-1', {
      name: 'Personal OS Enterprise',
      status: ProjectStatus.PAUSED
    });

    expect(updated.name).toBe('Personal OS Enterprise');
    expect(updated.status).toBe(ProjectStatus.PAUSED);
  });

  it('should calculate project health score based on tasks and deadline', async () => {
    const futureDeadline = new Date(Date.now() + 86400000 * 10);
    const project = await createProjectUseCase.execute('user-1', {
      name: 'AI Engine',
      deadline: futureDeadline.toISOString()
    });

    // Add 4 tasks: 2 completed, 2 pending
    const t1 = await createTaskUseCase.execute('user-1', { title: 'T1', projectId: project.id });
    const t2 = await createTaskUseCase.execute('user-1', { title: 'T2', projectId: project.id });
    await createTaskUseCase.execute('user-1', { title: 'T3', projectId: project.id });
    await createTaskUseCase.execute('user-1', { title: 'T4', projectId: project.id });

    await updateTaskUseCase.execute(t1.id, 'user-1', { status: TaskStatus.COMPLETED });
    await updateTaskUseCase.execute(t2.id, 'user-1', { status: TaskStatus.COMPLETED });

    const health = await calculateHealthUseCase.execute(project.id, 'user-1');

    expect(health.progressScore).toBe(50);
    expect(health.momentumScore).toBeGreaterThan(0);
    expect(health.lastCalculatedAt).toBeInstanceOf(Date);
  });

  it('should handle overdue project schedule risk', async () => {
    const pastDeadline = new Date(Date.now() - 86400000);
    const project = await createProjectUseCase.execute('user-1', {
      name: 'Overdue Project',
      deadline: pastDeadline.toISOString()
    });

    await createTaskUseCase.execute('user-1', { title: 'T1', projectId: project.id });

    const health = await calculateHealthUseCase.execute(project.id, 'user-1');
    expect(health.scheduleRiskScore).toBe(100);
    expect(health.progressScore).toBe(0);
  });

  it('should throw NotFoundError on non-existent project', async () => {
    await expect(updateProjectUseCase.execute('fake-id', 'user-1', { name: 'X' })).rejects.toThrow(NotFoundError);
    await expect(calculateHealthUseCase.execute('fake-id', 'user-1')).rejects.toThrow(NotFoundError);
  });
});
