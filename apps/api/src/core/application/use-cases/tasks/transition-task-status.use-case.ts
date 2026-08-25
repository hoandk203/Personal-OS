import { Task, TaskStatus } from '@personal-os/types';
import { NotFoundError } from '@personal-os/shared';
import { ITransitionTaskStatusUseCase } from '../../ports/in/task.use-cases.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';
import { EventBusPort } from '../../ports/out/event-bus.port.js';
import { TaskStatusChangedEvent } from '../../../domain/events/domain-events.js';

export class TransitionTaskStatusUseCase implements ITransitionTaskStatusUseCase {
  constructor(
    private readonly taskRepo: TaskRepositoryPort,
    private readonly eventBus?: EventBusPort
  ) {}

  async execute(id: string, userId: string, newStatus: TaskStatus, reason?: string): Promise<Task> {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new NotFoundError('Task', id);
    }

    const previousStatus = task.status;
    task.moveToStatus(newStatus);
    const saved = await this.taskRepo.save(task);

    if (this.eventBus) {
      await this.eventBus.publish(
        new TaskStatusChangedEvent(saved.id, saved.userId, previousStatus, newStatus, reason)
      );
    }

    return saved;
  }
}
