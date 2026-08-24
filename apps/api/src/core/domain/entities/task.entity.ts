import { DomainError } from '@personal-os/shared';
import { TaskStatus, Priority, Task as ITask } from '@personal-os/types';
import { CognitiveLoad } from '../value-objects/cognitive-load.vo.js';
import { TaskSourceVO } from '../value-objects/task-source.vo.js';

export class TaskEntity implements ITask {
  public cognitiveLoadVo: CognitiveLoad;
  public source: TaskSourceVO;

  constructor(
    readonly id: string,
    readonly userId: string,
    public projectId: string | null,
    public title: string,
    public description: string | null,
    public status: TaskStatus = TaskStatus.INBOX,
    public priority: Priority = Priority.MEDIUM,
    public dueAt: Date | null = null,
    public estimatedDurationMinutes: number | null = null,
    public actualDurationMinutes: number | null = null,
    cognitiveLoadLevel: number = 1,
    source?: Partial<TaskSourceVO>,
    public completedAt: Date | null = null,
    readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!title || title.trim().length === 0) {
      throw new DomainError('Task title cannot be empty', 'INVALID_TASK_TITLE');
    }
    this.cognitiveLoadVo = new CognitiveLoad(cognitiveLoadLevel);
    this.source = new TaskSourceVO(source);
  }

  get cognitiveLoad(): number {
    return this.cognitiveLoadVo.getValue();
  }

  set cognitiveLoad(val: number) {
    this.cognitiveLoadVo = new CognitiveLoad(val);
    this.updatedAt = new Date();
  }

  moveToStatus(newStatus: TaskStatus): void {
    if (this.status === TaskStatus.ARCHIVED && newStatus !== TaskStatus.ARCHIVED) {
      throw new DomainError('Cannot change status of an archived task without unarchiving', 'TASK_ARCHIVED');
    }

    if (newStatus === TaskStatus.COMPLETED && this.status !== TaskStatus.COMPLETED) {
      this.completedAt = new Date();
    } else if (newStatus !== TaskStatus.COMPLETED) {
      this.completedAt = null;
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.dueAt || this.status === TaskStatus.COMPLETED || this.status === TaskStatus.ARCHIVED) {
      return false;
    }
    return this.dueAt.getTime() < Date.now();
  }

  recordActualDuration(minutes: number): void {
    if (minutes < 0) {
      throw new DomainError('Duration minutes cannot be negative', 'INVALID_DURATION');
    }
    this.actualDurationMinutes = minutes;
    this.updatedAt = new Date();
  }
}
