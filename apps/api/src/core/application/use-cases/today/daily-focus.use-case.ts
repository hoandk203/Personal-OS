import { DailyFocusResponseDto, DailyFocus } from '@personal-os/types';
import { DomainError, NotFoundError } from '@personal-os/shared';
import { ISetDailyFocusUseCase, IGetDailyFocusUseCase, IToggleDailyFocusTaskUseCase } from '../../ports/in/today.use-cases.port.js';
import { DailyFocusRepositoryPort } from '../../ports/out/daily-focus-repository.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';
import { EventBusPort } from '../../ports/out/event-bus.port.js';
import { DailyFocusSetEvent } from '../../../domain/events/domain-events.js';
import { randomUUID } from 'node:crypto';

export class SetDailyFocusUseCase implements ISetDailyFocusUseCase {
  constructor(
    private readonly dailyFocusRepo: DailyFocusRepositoryPort,
    private readonly taskRepo: TaskRepositoryPort,
    private readonly eventBus?: EventBusPort
  ) {}

  async execute(userId: string, date: string, taskIds: string[]): Promise<DailyFocusResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (taskIds.length > 3) {
      throw new DomainError('Maximum 3 focus tasks allowed per day', 'DAILY_FOCUS_LIMIT_EXCEEDED');
    }

    // Verify tasks exist and belong to user
    const tasks = await this.taskRepo.findByIds(taskIds, userId);
    const validTaskIds = tasks.map(t => t.id);

    let existing = await this.dailyFocusRepo.findByUserAndDate(userId, targetDate);
    const completedTaskIds = tasks.filter(t => t.status === 'COMPLETED').map(t => t.id);

    const record: DailyFocus = {
      id: existing?.id ?? randomUUID(),
      userId,
      date: targetDate,
      taskIds: validTaskIds,
      completedTaskIds,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date()
    };

    await this.dailyFocusRepo.save(record);

    if (this.eventBus) {
      await this.eventBus.publish(new DailyFocusSetEvent(record.id, userId, targetDate, validTaskIds));
    }

    const completedCount = completedTaskIds.length;
    const totalCount = validTaskIds.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      date: targetDate,
      focusTaskIds: validTaskIds,
      completedTaskIds,
      tasks,
      completedCount,
      totalCount,
      completionRate
    };
  }
}

export class GetDailyFocusUseCase implements IGetDailyFocusUseCase {
  constructor(
    private readonly dailyFocusRepo: DailyFocusRepositoryPort,
    private readonly taskRepo: TaskRepositoryPort
  ) {}

  async execute(userId: string, date?: string): Promise<DailyFocusResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const focus = await this.dailyFocusRepo.findByUserAndDate(userId, targetDate);

    if (!focus || focus.taskIds.length === 0) {
      return {
        date: targetDate,
        focusTaskIds: [],
        completedTaskIds: [],
        tasks: [],
        completedCount: 0,
        totalCount: 0,
        completionRate: 0
      };
    }

    const tasks = await this.taskRepo.findByIds(focus.taskIds, userId);
    const completedTaskIds = tasks.filter(t => t.status === 'COMPLETED').map(t => t.id);
    const completedCount = completedTaskIds.length;
    const totalCount = tasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      date: targetDate,
      focusTaskIds: focus.taskIds,
      completedTaskIds,
      tasks,
      completedCount,
      totalCount,
      completionRate
    };
  }
}

export class ToggleDailyFocusTaskUseCase implements IToggleDailyFocusTaskUseCase {
  constructor(
    private readonly dailyFocusRepo: DailyFocusRepositoryPort,
    private readonly taskRepo: TaskRepositoryPort,
    private readonly setDailyFocusUseCase: SetDailyFocusUseCase
  ) {}

  async execute(userId: string, taskId: string, date?: string): Promise<DailyFocusResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const task = await this.taskRepo.findById(taskId, userId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }

    const focus = await this.dailyFocusRepo.findByUserAndDate(userId, targetDate);
    const currentIds = focus ? [...focus.taskIds] : [];

    const index = currentIds.indexOf(taskId);
    if (index >= 0) {
      currentIds.splice(index, 1);
    } else {
      if (currentIds.length >= 3) {
        throw new DomainError('Maximum 3 focus tasks allowed per day', 'DAILY_FOCUS_LIMIT_EXCEEDED');
      }
      currentIds.push(taskId);
    }

    return this.setDailyFocusUseCase.execute(userId, targetDate, currentIds);
  }
}
