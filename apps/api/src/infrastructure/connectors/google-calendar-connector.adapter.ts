import { ScheduleBlock, ScheduleBlockType } from '@personal-os/types';
import {
  CalendarConnectorPort,
  CalendarMeeting,
  CalendarSyncData
} from '../../core/application/ports/out/calendar-connector.port.js';

export class GoogleCalendarConnectorAdapter implements CalendarConnectorPort {
  async syncSchedule(
    _userId: string,
    date: string,
    _token?: string,
    _options?: { mockFallback?: boolean }
  ): Promise<CalendarSyncData> {
    // Generate deterministic schedule & calculate meeting / free slots
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Sample meetings: 10:00 - 10:45 (Sprint Sync), 14:00 - 15:00 (Architecture Review)
    const m1Start = new Date(`${targetDate}T10:00:00Z`);
    const m1End = new Date(`${targetDate}T10:45:00Z`);
    const m2Start = new Date(`${targetDate}T14:00:00Z`);
    const m2End = new Date(`${targetDate}T15:00:00Z`);

    const meetings: CalendarMeeting[] = [
      {
        id: `cal-m1-${targetDate}`,
        title: 'Daily Architecture & Sprint Sync',
        startTime: m1Start,
        endTime: m1End,
        durationMinutes: 45,
        attendeesCount: 4,
        hangoutLink: 'https://meet.google.com/xyz-core-pos'
      },
      {
        id: `cal-m2-${targetDate}`,
        title: 'Deep Work Alignment & Code Review',
        startTime: m2Start,
        endTime: m2End,
        durationMinutes: 60,
        attendeesCount: 2,
        hangoutLink: 'https://meet.google.com/abc-arch-rev'
      }
    ];

    const totalMeetingMinutes = meetings.reduce((acc, m) => acc + m.durationMinutes, 0);

    // Free work slots between 09:00 and 18:00 (540 total minutes window)
    // Slot 1: 09:00 - 10:00 (60 mins)
    // Slot 2: 10:45 - 14:00 (195 mins - Deep Work block)
    // Slot 3: 15:00 - 18:00 (180 mins - Deep Work block)
    const freeSlots = [
      {
        startTime: new Date(`${targetDate}T09:00:00Z`),
        endTime: new Date(`${targetDate}T10:00:00Z`),
        durationMinutes: 60
      },
      {
        startTime: new Date(`${targetDate}T10:45:00Z`),
        endTime: new Date(`${targetDate}T14:00:00Z`),
        durationMinutes: 195
      },
      {
        startTime: new Date(`${targetDate}T15:00:00Z`),
        endTime: new Date(`${targetDate}T18:00:00Z`),
        durationMinutes: 180
      }
    ];

    const totalFreeMinutes = freeSlots.reduce((acc, s) => acc + s.durationMinutes, 0);

    const scheduleBlocks: ScheduleBlock[] = [
      {
        id: `sb-free-1`,
        type: ScheduleBlockType.FREE_SLOT,
        title: 'Morning Planning & Inbox Zero',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60
      },
      {
        id: `sb-m-1`,
        type: ScheduleBlockType.MEETING,
        title: meetings[0].title,
        startTime: '10:00',
        endTime: '10:45',
        durationMinutes: 45,
        metadata: { hangoutLink: meetings[0].hangoutLink }
      },
      {
        id: `sb-deep-1`,
        type: ScheduleBlockType.DEEP_WORK,
        title: 'Deep Work Block: Core System Engineering',
        startTime: '10:45',
        endTime: '14:00',
        durationMinutes: 195,
        isFocusBlock: true
      },
      {
        id: `sb-m-2`,
        type: ScheduleBlockType.MEETING,
        title: meetings[1].title,
        startTime: '14:00',
        endTime: '15:00',
        durationMinutes: 60,
        metadata: { hangoutLink: meetings[1].hangoutLink }
      },
      {
        id: `sb-deep-2`,
        type: ScheduleBlockType.DEEP_WORK,
        title: 'Deep Work Block: Automated Testing & Review',
        startTime: '15:00',
        endTime: '18:00',
        durationMinutes: 180,
        isFocusBlock: true
      }
    ];

    return {
      date: targetDate,
      meetings,
      totalMeetingMinutes,
      freeSlots,
      totalFreeMinutes,
      scheduleBlocks,
      syncedAt: new Date()
    };
  }
}
