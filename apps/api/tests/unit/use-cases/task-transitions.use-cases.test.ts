import { describe, it, expect, beforeEach } from 'vitest';
import { TransitionTaskStatusUseCase } from '../../../src/core/application/use-cases/tasks/transition-task-status.use-case.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { EventEmitterBusAdapter } from '../../../src/infrastructure/events/event-emitter-bus.adapter.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { TaskStatus, Priority, TaskStatusChangedEvent } from '@personal-os/types';
import { NotFoundError } from '@personal-os/shared';

describe('Task Transitions & Advanced Query Test Suite', () => {
  let taskRepo: InMemoryTaskRepository;
  let eventBus: EventEmitterBusAdapter;

  beforeEach(() => {
    taskRepo = new InMemoryTaskRepository();
    eventBus = new EventEmitterBusAdapter();
  });

  describe('TransitionTaskStatusUseCase', () => {
    it('should transition status through full lifecycle and emit domain event', async () => {
      const task = new TaskEntity('t-1', 'u-1', null, 'Implement Transition Logic', null, TaskStatus.INBOX, Priority.HIGH);
      await taskRepo.save(task);

      let eventReceived: any = null;
      eventBus.subscribe('task.status_changed', async (e: any) => {
        eventReceived = e;
      });

      const useCase = new TransitionTaskStatusUseCase(taskRepo, eventBus);

      const movedToPlanned = await useCase.execute('t-1', 'u-1', TaskStatus.PLANNED, 'Assigned to sprint');
      expect(movedToPlanned.status).toBe(TaskStatus.PLANNED);
      expect(eventReceived?.newStatus).toBe(TaskStatus.PLANNED);
      expect(eventReceived?.reason).toBe('Assigned to sprint');

      const movedToInProgress = await useCase.execute('t-1', 'u-1', TaskStatus.IN_PROGRESS);
      expect(movedToInProgress.status).toBe(TaskStatus.IN_PROGRESS);

      const movedToDone = await useCase.execute('t-1', 'u-1', TaskStatus.COMPLETED);
      expect(movedToDone.status).toBe(TaskStatus.COMPLETED);
      expect(movedToDone.completedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError if task does not exist', async () => {
      const useCase = new TransitionTaskStatusUseCase(taskRepo, eventBus);
      await expect(useCase.execute('missing-id', 'u-1', TaskStatus.COMPLETED)).rejects.toThrow(NotFoundError);
    });
  });

  describe('InMemoryTaskRepository Filters', () => {
    it('should filter by priority, cognitive load range, and search query', async () => {
      await taskRepo.save(new TaskEntity('t-1', 'u-1', 'p-1', 'Build API Auth', 'JWT token validation', TaskStatus.IN_PROGRESS, Priority.HIGH, null, 60, null, 4));
      await taskRepo.save(new TaskEntity('t-2', 'u-1', 'p-1', 'Design UI Tokens', 'Dark theme colors', TaskStatus.COMPLETED, Priority.LOW, null, 30, null, 2));
      await taskRepo.save(new TaskEntity('t-3', 'u-1', 'p-2', 'Optimize Queries', 'PostgreSQL indexing', TaskStatus.INBOX, Priority.HIGH, null, 90, null, 5));

      // Filter by priority
      const highTasks = await taskRepo.findMany({ userId: 'u-1', priority: Priority.HIGH });
      expect(highTasks.length).toBe(2);

      // Filter by cognitive load range
      const heavyTasks = await taskRepo.findMany({ userId: 'u-1', minCognitiveLoad: 4 });
      expect(heavyTasks.length).toBe(2);

      const lightTasks = await taskRepo.findMany({ userId: 'u-1', maxCognitiveLoad: 2 });
      expect(lightTasks.length).toBe(1);

      // Filter by search query
      const searchRes = await taskRepo.findMany({ userId: 'u-1', search: 'tokens' });
      expect(searchRes.length).toBe(1);
      expect(searchRes[0].title).toBe('Design UI Tokens');

      // findByIds
      const batchTasks = await taskRepo.findByIds(['t-1', 't-3'], 'u-1');
      expect(batchTasks.length).toBe(2);
    });
  });
});
