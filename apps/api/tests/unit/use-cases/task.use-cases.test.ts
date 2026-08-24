import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTaskUseCase } from '../../../src/core/application/use-cases/tasks/create-task.use-case.js';
import { UpdateTaskUseCase } from '../../../src/core/application/use-cases/tasks/update-task.use-case.js';
import { ListTasksUseCase, DeleteTaskUseCase } from '../../../src/core/application/use-cases/tasks/list-tasks.use-case.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { EventEmitterBusAdapter } from '../../../src/infrastructure/events/event-emitter-bus.adapter.js';
import { Priority, TaskStatus, SourceType } from '@personal-os/types';
import { NotFoundError } from '@personal-os/shared';

describe('Task Use Cases Suite', () => {
  let taskRepo: InMemoryTaskRepository;
  let eventBus: EventEmitterBusAdapter;
  let createTaskUseCase: CreateTaskUseCase;
  let updateTaskUseCase: UpdateTaskUseCase;
  let listTasksUseCase: ListTasksUseCase;
  let deleteTaskUseCase: DeleteTaskUseCase;

  beforeEach(() => {
    taskRepo = new InMemoryTaskRepository();
    eventBus = new EventEmitterBusAdapter();
    createTaskUseCase = new CreateTaskUseCase(taskRepo, eventBus);
    updateTaskUseCase = new UpdateTaskUseCase(taskRepo, eventBus);
    listTasksUseCase = new ListTasksUseCase(taskRepo);
    deleteTaskUseCase = new DeleteTaskUseCase(taskRepo);
  });

  it('should create a task and publish domain event', async () => {
    let capturedEvent: any = null;
    eventBus.subscribe('task.created', (event) => {
      capturedEvent = event;
    });

    const task = await createTaskUseCase.execute('user-1', {
      title: 'Build Clean Architecture',
      description: 'Implement domain ports and use cases',
      priority: Priority.HIGH,
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      estimatedDurationMinutes: 120,
      cognitiveLoad: 4,
      source: {
        type: SourceType.GITHUB,
        externalReferenceId: 'PR-42',
        externalUrl: 'https://github.com/shinki/personal-os/pull/42'
      }
    });

    expect(task.id).toBeDefined();
    expect(task.userId).toBe('user-1');
    expect(task.status).toBe(TaskStatus.INBOX);
    expect(task.priority).toBe(Priority.HIGH);
    expect(task.cognitiveLoad).toBe(4);
    expect(task.source.isExternal()).toBe(true);

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent.title).toBe('Build Clean Architecture');
  });

  it('should update task properties and status with status event emission', async () => {
    const task = await createTaskUseCase.execute('user-1', {
      title: 'Initial Task'
    });

    let statusEventCaptured: any = null;
    eventBus.subscribe('task.status_changed', (event) => {
      statusEventCaptured = event;
    });

    const updated = await updateTaskUseCase.execute(task.id, 'user-1', {
      title: 'Updated Task Title',
      status: TaskStatus.COMPLETED,
      actualDurationMinutes: 45,
      cognitiveLoad: 3
    });

    expect(updated.title).toBe('Updated Task Title');
    expect(updated.status).toBe(TaskStatus.COMPLETED);
    expect(updated.actualDurationMinutes).toBe(45);
    expect(updated.completedAt).toBeInstanceOf(Date);

    expect(statusEventCaptured).not.toBeNull();
    expect(statusEventCaptured.newStatus).toBe(TaskStatus.COMPLETED);
  });

  it('should list tasks filtered by status and overdue flag', async () => {
    await createTaskUseCase.execute('user-1', {
      title: 'Active Task 1',
      dueAt: new Date(Date.now() + 500000).toISOString()
    });

    const overdueTask = await createTaskUseCase.execute('user-1', {
      title: 'Overdue Task',
      dueAt: new Date(Date.now() - 500000).toISOString()
    });

    const allTasks = await listTasksUseCase.execute({ userId: 'user-1' });
    expect(allTasks).toHaveLength(2);

    const overdueOnly = await listTasksUseCase.execute({ userId: 'user-1', isOverdue: true });
    expect(overdueOnly).toHaveLength(1);
    expect(overdueOnly[0].id).toBe(overdueTask.id);
  });

  it('should delete task or throw NotFoundError', async () => {
    const task = await createTaskUseCase.execute('user-1', { title: 'To delete' });
    const success = await deleteTaskUseCase.execute(task.id, 'user-1');
    expect(success).toBe(true);

    await expect(deleteTaskUseCase.execute('non-existent', 'user-1')).rejects.toThrow(NotFoundError);
    await expect(updateTaskUseCase.execute('non-existent', 'user-1', { title: 'X' })).rejects.toThrow(NotFoundError);
  });
});
