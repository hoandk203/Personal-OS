import { TaskEntity } from '../../../core/domain/entities/task.entity.js';
import { TaskRepositoryPort, TaskFilterOptions } from '../../../core/application/ports/out/task-repository.port.js';

export class InMemoryTaskRepository implements TaskRepositoryPort {
  private readonly tasks = new Map<string, TaskEntity>();

  async save(task: TaskEntity): Promise<TaskEntity> {
    this.tasks.set(task.id, task);
    return task;
  }

  async findById(id: string, userId: string): Promise<TaskEntity | null> {
    const task = this.tasks.get(id);
    if (task && task.userId === userId) {
      return task;
    }
    return null;
  }

  async findMany(filter: TaskFilterOptions): Promise<TaskEntity[]> {
    let result = Array.from(this.tasks.values()).filter(t => t.userId === filter.userId);

    if (filter.projectId !== undefined) {
      result = result.filter(t => t.projectId === filter.projectId);
    }

    if (filter.status !== undefined) {
      result = result.filter(t => t.status === filter.status);
    }

    if (filter.dueBefore !== undefined) {
      result = result.filter(t => t.dueAt !== null && t.dueAt <= filter.dueBefore!);
    }

    if (filter.isOverdue === true) {
      result = result.filter(t => t.isOverdue());
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (task && task.userId === userId) {
      this.tasks.delete(id);
      return true;
    }
    return false;
  }

  async countCompletedByProject(projectId: string, userId: string): Promise<number> {
    return Array.from(this.tasks.values()).filter(
      t => t.userId === userId && t.projectId === projectId && t.status === 'COMPLETED'
    ).length;
  }

  async countTotalByProject(projectId: string, userId: string): Promise<number> {
    return Array.from(this.tasks.values()).filter(
      t => t.userId === userId && t.projectId === projectId
    ).length;
  }

  clear(): void {
    this.tasks.clear();
  }
}
