import { CreateTaskDto, UpdateTaskDto, Task, TaskStatus } from '@personal-os/types';
import { TaskFilterOptions } from '../out/task-repository.port.js';

export interface ICreateTaskUseCase {
  execute(userId: string, dto: CreateTaskDto): Promise<Task>;
}

export interface IUpdateTaskUseCase {
  execute(id: string, userId: string, dto: UpdateTaskDto): Promise<Task>;
}

export interface ITransitionTaskStatusUseCase {
  execute(id: string, userId: string, newStatus: TaskStatus, reason?: string): Promise<Task>;
}

export interface IListTasksUseCase {
  execute(filter: TaskFilterOptions): Promise<Task[]>;
}

export interface IDeleteTaskUseCase {
  execute(id: string, userId: string): Promise<boolean>;
}
