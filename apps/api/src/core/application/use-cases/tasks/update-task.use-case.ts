import { NotFoundError } from '@personal-os/shared';
import { UpdateTaskDto, Task } from '@personal-os/types';
import { TaskStatusChangedEvent } from '../../../domain/events/domain-events.js';
import { IUpdateTaskUseCase } from '../../ports/in/task.use-cases.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';
import { EventBusPort } from '../../ports/out/event-bus.port.js';

export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    private readonly taskRepo: TaskRepositoryPort,
    private readonly eventBus?: EventBusPort
  ) {}

  async execute(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findById(id, userId);
    if (!task) {
      throw new NotFoundError('Task', id);
    }

    const oldStatus = task.status;

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.projectId !== undefined) task.projectId = dto.projectId;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueAt !== undefined) task.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    if (dto.estimatedDurationMinutes !== undefined) task.estimatedDurationMinutes = dto.estimatedDurationMinutes;
    if (dto.actualDurationMinutes !== undefined) task.recordActualDuration(dto.actualDurationMinutes);
    if (dto.cognitiveLoad !== undefined) task.cognitiveLoad = dto.cognitiveLoad;

    if (dto.status !== undefined && dto.status !== oldStatus) {
      task.moveToStatus(dto.status);
      if (this.eventBus) {
        await this.eventBus.publish(new TaskStatusChangedEvent(task.id, task.userId, oldStatus, task.status));
      }
    }

    return this.taskRepo.save(task);
  }
}
