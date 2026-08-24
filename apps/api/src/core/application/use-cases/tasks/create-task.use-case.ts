import { CreateTaskDto, Task, Priority, TaskStatus } from '@personal-os/types';
import { TaskEntity } from '../../../domain/entities/task.entity.js';
import { TaskCreatedEvent } from '../../../domain/events/domain-events.js';
import { ICreateTaskUseCase } from '../../ports/in/task.use-cases.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';
import { EventBusPort } from '../../ports/out/event-bus.port.js';
import { randomUUID } from 'node:crypto';

export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    private readonly taskRepo: TaskRepositoryPort,
    private readonly eventBus?: EventBusPort
  ) {}

  async execute(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = new TaskEntity(
      randomUUID(),
      userId,
      dto.projectId ?? null,
      dto.title,
      dto.description ?? null,
      TaskStatus.INBOX,
      dto.priority ?? Priority.MEDIUM,
      dto.dueAt ? new Date(dto.dueAt) : null,
      dto.estimatedDurationMinutes ?? null,
      null,
      dto.cognitiveLoad ?? 1,
      dto.source
    );

    const saved = await this.taskRepo.save(task);

    if (this.eventBus) {
      await this.eventBus.publish(
        new TaskCreatedEvent(saved.id, saved.userId, saved.title, saved.priority, saved.projectId)
      );
    }

    return saved;
  }
}
