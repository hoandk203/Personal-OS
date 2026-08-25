import { describe, it, expect } from 'vitest';
import { GitHubConnectorAdapter } from '../../../src/infrastructure/connectors/github-connector.adapter.js';
import { GoogleCalendarConnectorAdapter } from '../../../src/infrastructure/connectors/google-calendar-connector.adapter.js';
import { SyncGitHubActivityUseCase } from '../../../src/core/application/use-cases/connectors/sync-github-activity.use-case.js';
import { SyncCalendarScheduleUseCase } from '../../../src/core/application/use-cases/connectors/sync-calendar-schedule.use-case.js';
import { InMemoryEventRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { SourceType, ScheduleBlockType } from '@personal-os/types';

describe('Connectors & Adapters Test Suite', () => {
  describe('GitHubConnectorAdapter', () => {
    it('should generate deterministic mock activity when no token provided', async () => {
      const adapter = new GitHubConnectorAdapter();
      const result = await adapter.syncActivity('u-1');

      expect(result.commits.length).toBeGreaterThan(0);
      expect(result.pullRequests.length).toBeGreaterThan(0);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.bottleneckPrs.length).toBe(1); // PR #98 open > 20h
      expect(result.bottleneckPrs[0].isBottleneck).toBe(true);
      expect(result.bottleneckPrs[0].hoursOpen).toBe(28);
    });

    it('should handle fetch failure gracefully and fallback to mock data', async () => {
      const adapter = new GitHubConnectorAdapter();
      // Provide dummy token with mockFallback: false to exercise API branch & fallback
      const result = await adapter.syncActivity('u-1', 'ghp_invalid_dummy_token_123', { mockFallback: false });
      expect(result.commits.length).toBeGreaterThan(0);
      expect(result.pullRequests.length).toBeGreaterThan(0);
    });
  });

  describe('GoogleCalendarConnectorAdapter', () => {
    it('should sync schedule, compute meetings and deep work free slots', async () => {
      const adapter = new GoogleCalendarConnectorAdapter();
      const date = '2026-08-25';
      const result = await adapter.syncSchedule('u-1', date);

      expect(result.date).toBe(date);
      expect(result.meetings.length).toBe(2);
      expect(result.totalMeetingMinutes).toBe(105);
      expect(result.freeSlots.length).toBe(3);
      expect(result.totalFreeMinutes).toBe(435);

      const deepWorkBlocks = result.scheduleBlocks.filter(b => b.type === ScheduleBlockType.DEEP_WORK);
      expect(deepWorkBlocks.length).toBe(2);
      expect(deepWorkBlocks[0].durationMinutes).toBe(195);
    });
  });

  describe('SyncGitHubActivityUseCase', () => {
    it('should execute GitHub sync, generate warnings for bottleneck PRs, and ingest events', async () => {
      const adapter = new GitHubConnectorAdapter();
      const eventRepo = new InMemoryEventRepository();
      const useCase = new SyncGitHubActivityUseCase(adapter, eventRepo);

      const result = await useCase.execute('u-1');

      expect(result.source).toBe(SourceType.GITHUB);
      expect(result.success).toBe(true);
      expect(result.itemsSynced).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('open for 28h without review');

      const events = await eventRepo.findRecentByUser('u-1', 10);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should execute without event repo', async () => {
      const adapter = new GitHubConnectorAdapter();
      const useCase = new SyncGitHubActivityUseCase(adapter);

      const result = await useCase.execute('u-1');
      expect(result.success).toBe(true);
    });
  });

  describe('SyncCalendarScheduleUseCase', () => {
    it('should execute Calendar sync and ingest events into event repository', async () => {
      const adapter = new GoogleCalendarConnectorAdapter();
      const eventRepo = new InMemoryEventRepository();
      const useCase = new SyncCalendarScheduleUseCase(adapter, eventRepo);

      const result = await useCase.execute('u-1', '2026-08-25');

      expect(result.source).toBe(SourceType.GOOGLE_CALENDAR);
      expect(result.success).toBe(true);
      expect(result.itemsSynced).toBe(2);

      const events = await eventRepo.findRecentByUser('u-1', 10);
      expect(events.length).toBe(2);
    });

    it('should warn when meeting load exceeds 240 minutes', async () => {
      const mockAdapter = {
        syncSchedule: async () => ({
          date: '2026-08-25',
          meetings: [{ id: 'm-1', title: 'Long All Hands', startTime: new Date(), endTime: new Date(), durationMinutes: 300 }],
          totalMeetingMinutes: 300,
          freeSlots: [],
          totalFreeMinutes: 0,
          scheduleBlocks: [],
          syncedAt: new Date()
        })
      };

      const useCase = new SyncCalendarScheduleUseCase(mockAdapter as any);
      const result = await useCase.execute('u-1');
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0]).toContain('High meeting load today');
    });
  });
});
