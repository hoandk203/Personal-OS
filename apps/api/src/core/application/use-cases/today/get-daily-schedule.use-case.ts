import { DailyScheduleResponseDto, ScheduleBlock, ScheduleBlockType } from '@personal-os/types';
import { IGetDailyScheduleUseCase } from '../../ports/in/today.use-cases.port.js';
import { CalendarConnectorPort } from '../../ports/out/calendar-connector.port.js';
import { DailyFocusRepositoryPort } from '../../ports/out/daily-focus-repository.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';

export class GetDailyScheduleUseCase implements IGetDailyScheduleUseCase {
  constructor(
    private readonly calendarConnector: CalendarConnectorPort,
    private readonly dailyFocusRepo?: DailyFocusRepositoryPort,
    private readonly taskRepo?: TaskRepositoryPort
  ) {}

  async execute(userId: string, date?: string): Promise<DailyScheduleResponseDto> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const calData = await this.calendarConnector.syncSchedule(userId, targetDate);

    const blocks: ScheduleBlock[] = [...calData.scheduleBlocks];

    // If daily focus tasks exist, attach them to deep work blocks
    if (this.dailyFocusRepo && this.taskRepo) {
      const focus = await this.dailyFocusRepo.findByUserAndDate(userId, targetDate);
      if (focus && focus.taskIds.length > 0) {
        const tasks = await this.taskRepo.findByIds(focus.taskIds, userId);
        const activeFocusTasks = tasks.filter(t => t.status !== 'COMPLETED');

        // Augment first deep work block with focus task title if available
        const deepWorkBlock = blocks.find(b => b.type === ScheduleBlockType.DEEP_WORK);
        if (deepWorkBlock && activeFocusTasks.length > 0) {
          deepWorkBlock.title = `Focus: ${activeFocusTasks[0].title}`;
          deepWorkBlock.taskId = activeFocusTasks[0].id;
        }
      }
    }

    const totalDeepWorkMinutes = blocks
      .filter(b => b.type === ScheduleBlockType.DEEP_WORK)
      .reduce((acc, b) => acc + b.durationMinutes, 0);

    return {
      date: targetDate,
      blocks,
      totalMeetingMinutes: calData.totalMeetingMinutes,
      totalDeepWorkMinutes,
      totalFreeMinutes: calData.totalFreeMinutes
    };
  }
}
