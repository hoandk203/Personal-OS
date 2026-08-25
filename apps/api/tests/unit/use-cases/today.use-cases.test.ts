import { describe, it, expect, beforeEach } from 'vitest';
import { SetDailyFocusUseCase, GetDailyFocusUseCase, ToggleDailyFocusTaskUseCase } from '../../../src/core/application/use-cases/today/daily-focus.use-case.js';
import { GetDailyScheduleUseCase } from '../../../src/core/application/use-cases/today/get-daily-schedule.use-case.js';
import { GetActivityTimelineUseCase } from '../../../src/core/application/use-cases/today/get-activity-timeline.use-case.js';
import { InMemoryDailyFocusRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-daily-focus.repository.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { InMemoryEventRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { GoogleCalendarConnectorAdapter } from '../../../src/infrastructure/connectors/google-calendar-connector.adapter.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { EventEntity } from '../../../src/core/domain/entities/event.entity.js';
import { TaskStatus, Priority, SourceType } from '@personal-os/types';
import { DomainError, NotFoundError } from '@personal-os/shared';

describe('Today & Daily Focus Use Cases Suite', () => {
  let dailyFocusRepo: InMemoryDailyFocusRepository;
  let taskRepo: InMemoryTaskRepository;
  let eventRepo: InMemoryEventRepository;
  let calendarConnector: GoogleCalendarConnectorAdapter;

  beforeEach(async () => {
    dailyFocusRepo = new InMemoryDailyFocusRepository();
    taskRepo = new InMemoryTaskRepository();
    eventRepo = new InMemoryEventRepository();
    calendarConnector = new GoogleCalendarConnectorAdapter();

    // Create 4 sample tasks
    await taskRepo.save(new TaskEntity('t-1', 'u-1', null, 'Task 1', null, TaskStatus.COMPLETED, Priority.HIGH));
    await taskRepo.save(new TaskEntity('t-2', 'u-1', null, 'Task 2', null, TaskStatus.IN_PROGRESS, Priority.MEDIUM));
    await taskRepo.save(new TaskEntity('t-3', 'u-1', null, 'Task 3', null, TaskStatus.PLANNED, Priority.LOW));
    await taskRepo.save(new TaskEntity('t-4', 'u-1', null, 'Task 4', null, TaskStatus.INBOX, Priority.LOW));
  });

  describe('DailyFocusRepository', () => {
    it('should save, find, and list recent daily focuses', async () => {
      const focus = {
        id: 'df-1',
        userId: 'u-1',
        date: '2026-08-25',
        taskIds: ['t-1', 't-2'],
        completedTaskIds: ['t-1'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await dailyFocusRepo.save(focus);
      const found = await dailyFocusRepo.findByUserAndDate('u-1', '2026-08-25');
      expect(found?.id).toBe('df-1');

      const recent = await dailyFocusRepo.findRecent('u-1');
      expect(recent.length).toBe(1);

      dailyFocusRepo.clear();
      expect(await dailyFocusRepo.findByUserAndDate('u-1', '2026-08-25')).toBeNull();
    });
  });

  describe('SetDailyFocusUseCase & GetDailyFocusUseCase', () => {
    it('should set focus tasks and calculate completion rate accurately', async () => {
      const setUseCase = new SetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      const getUseCase = new GetDailyFocusUseCase(dailyFocusRepo, taskRepo);

      const res = await setUseCase.execute('u-1', '2026-08-25', ['t-1', 't-2']);
      expect(res.focusTaskIds.length).toBe(2);
      expect(res.completedCount).toBe(1); // t-1 is COMPLETED
      expect(res.totalCount).toBe(2);
      expect(res.completionRate).toBe(50);

      const fetched = await getUseCase.execute('u-1', '2026-08-25');
      expect(fetched.completionRate).toBe(50);
    });

    it('should throw error when more than 3 tasks are provided', async () => {
      const setUseCase = new SetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      await expect(
        setUseCase.execute('u-1', '2026-08-25', ['t-1', 't-2', 't-3', 't-4'])
      ).rejects.toThrow(DomainError);
    });

    it('should return empty focus response when no focus set', async () => {
      const getUseCase = new GetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      const res = await getUseCase.execute('u-1', '2026-09-01');
      expect(res.focusTaskIds.length).toBe(0);
      expect(res.completionRate).toBe(0);
    });
  });

  describe('ToggleDailyFocusTaskUseCase', () => {
    it('should toggle tasks into focus, toggle out, and prevent > 3 tasks', async () => {
      const setUseCase = new SetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      const toggleUseCase = new ToggleDailyFocusTaskUseCase(dailyFocusRepo, taskRepo, setUseCase);

      // Pin t-1
      let res = await toggleUseCase.execute('u-1', 't-1', '2026-08-25');
      expect(res.focusTaskIds).toContain('t-1');

      // Pin t-2, t-3
      await toggleUseCase.execute('u-1', 't-2', '2026-08-25');
      res = await toggleUseCase.execute('u-1', 't-3', '2026-08-25');
      expect(res.focusTaskIds.length).toBe(3);

      // Attempting to pin 4th task throws
      await expect(toggleUseCase.execute('u-1', 't-4', '2026-08-25')).rejects.toThrow(DomainError);

      // Unpin t-2
      res = await toggleUseCase.execute('u-1', 't-2', '2026-08-25');
      expect(res.focusTaskIds).not.toContain('t-2');
      expect(res.focusTaskIds.length).toBe(2);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      const setUseCase = new SetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      const toggleUseCase = new ToggleDailyFocusTaskUseCase(dailyFocusRepo, taskRepo, setUseCase);

      await expect(toggleUseCase.execute('u-1', 'non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('GetDailyScheduleUseCase', () => {
    it('should combine calendar schedule and attach focus task to deep work block', async () => {
      const setUseCase = new SetDailyFocusUseCase(dailyFocusRepo, taskRepo);
      await setUseCase.execute('u-1', '2026-08-25', ['t-2']); // t-2 is IN_PROGRESS

      const scheduleUseCase = new GetDailyScheduleUseCase(calendarConnector, dailyFocusRepo, taskRepo);
      const res = await scheduleUseCase.execute('u-1', '2026-08-25');

      expect(res.blocks.length).toBeGreaterThan(0);
      expect(res.totalMeetingMinutes).toBe(105);
      expect(res.totalDeepWorkMinutes).toBeGreaterThan(0);

      // Find deep work block
      const deepBlock = res.blocks.find(b => b.type === 'DEEP_WORK');
      expect(deepBlock?.title).toContain('Focus: Task 2');
    });

    it('should execute schedule without focus repos attached', async () => {
      const scheduleUseCase = new GetDailyScheduleUseCase(calendarConnector);
      const res = await scheduleUseCase.execute('u-1');
      expect(res.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('GetActivityTimelineUseCase', () => {
    it('should format activity timeline from multiple event sources and fallback tasks', async () => {
      await eventRepo.save(new EventEntity('e-1', 'u-1', 'github.commit.created', SourceType.GITHUB, 'sha-1', { message: 'feat: add task', repo: 'personal-os' }));
      await eventRepo.save(new EventEntity('e-2', 'u-1', 'github.pull_request.merged', SourceType.GITHUB, 'pr-1', { number: 101, title: 'Kanban board' }));
      await eventRepo.save(new EventEntity('e-3', 'u-1', 'calendar.meeting.scheduled', SourceType.GOOGLE_CALENDAR, 'm-1', { title: 'Sync', durationMinutes: 45 }));
      await eventRepo.save(new EventEntity('e-4', 'u-1', 'task.status_changed', SourceType.MANUAL, 't-1', { title: 'Task moved' }));

      const timelineUseCase = new GetActivityTimelineUseCase(eventRepo, taskRepo);
      const res = await timelineUseCase.execute('u-1', 10);

      expect(res.items.length).toBeGreaterThanOrEqual(4);
      expect(res.items[0]).toHaveProperty('id');
      expect(res.items[0]).toHaveProperty('title');
      expect(res.items[0]).toHaveProperty('source');
    });
  });
});
