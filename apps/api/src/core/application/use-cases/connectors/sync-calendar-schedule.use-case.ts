import { ConnectorSyncResultDto, SourceType } from '@personal-os/types';
import { ISyncCalendarScheduleUseCase } from '../../ports/in/connector.use-cases.port.js';
import { CalendarConnectorPort } from '../../ports/out/calendar-connector.port.js';
import { EventRepositoryPort } from '../../ports/out/event-repository.port.js';
import { EventEntity } from '../../../domain/entities/event.entity.js';
import { randomUUID } from 'node:crypto';

export class SyncCalendarScheduleUseCase implements ISyncCalendarScheduleUseCase {
  constructor(
    private readonly calendarConnector: CalendarConnectorPort,
    private readonly eventRepo?: EventRepositoryPort
  ) {}

  async execute(userId: string, date?: string, options?: { mockFallback?: boolean; token?: string }): Promise<ConnectorSyncResultDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = await this.calendarConnector.syncSchedule(userId, targetDate, options?.token, options);

    const warnings: string[] = [];
    if (data.totalMeetingMinutes > 240) {
      warnings.push(`High meeting load today (${Math.round(data.totalMeetingMinutes / 60)}h). Deep work time is constrained.`);
    }

    if (this.eventRepo) {
      for (const m of data.meetings) {
        const event = new EventEntity(
          randomUUID(),
          userId,
          'calendar.meeting.scheduled',
          SourceType.GOOGLE_CALENDAR,
          m.id,
          {
            title: m.title,
            startTime: m.startTime.toISOString(),
            endTime: m.endTime.toISOString(),
            durationMinutes: m.durationMinutes,
            hangoutLink: m.hangoutLink
          },
          m.startTime
        );
        await this.eventRepo.save(event);
      }
    }

    return {
      source: SourceType.GOOGLE_CALENDAR,
      success: true,
      itemsSynced: data.meetings.length,
      warnings,
      syncedAt: data.syncedAt.toISOString(),
      summary: {
        date: data.date,
        totalMeetingsCount: data.meetings.length,
        totalMeetingMinutes: data.totalMeetingMinutes,
        freeSlotsCount: data.freeSlots.length,
        totalFreeMinutes: data.totalFreeMinutes,
        scheduleBlocks: data.scheduleBlocks,
        meetings: data.meetings
      }
    };
  }
}
