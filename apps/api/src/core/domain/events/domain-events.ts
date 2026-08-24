import { TaskStatus, Priority } from '@personal-os/types';

export interface IDomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

export class TaskCreatedEvent implements IDomainEvent {
  readonly eventName = 'task.created';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly title: string,
    readonly priority: Priority,
    readonly projectId: string | null
  ) {}
}

export class TaskStatusChangedEvent implements IDomainEvent {
  readonly eventName = 'task.status_changed';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly oldStatus: TaskStatus,
    readonly newStatus: TaskStatus
  ) {}
}

export class ProjectCreatedEvent implements IDomainEvent {
  readonly eventName = 'project.created';
  readonly occurredAt = new Date();

  constructor(
    readonly aggregateId: string,
    readonly userId: string,
    readonly name: string
  ) {}
}
