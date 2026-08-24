import { Task } from '@personal-os/types';
import { IListTasksUseCase, IDeleteTaskUseCase } from '../../ports/in/task.use-cases.port.js';
import { TaskRepositoryPort, TaskFilterOptions } from '../../ports/out/task-repository.port.js';
import { NotFoundError } from '@personal-os/shared';

export class ListTasksUseCase implements IListTasksUseCase {
  constructor(private readonly taskRepo: TaskRepositoryPort) {}

  async execute(filter: TaskFilterOptions): Promise<Task[]> {
    return this.taskRepo.findMany(filter);
  }
}

export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(private readonly taskRepo: TaskRepositoryPort) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const deleted = await this.taskRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Task', id);
    }
    return true;
  }
}
