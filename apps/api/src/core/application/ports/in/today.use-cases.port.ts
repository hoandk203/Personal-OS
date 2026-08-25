import { DailyFocusResponseDto, DailyScheduleResponseDto, ActivityTimelineResponseDto } from '@personal-os/types';

export interface ISetDailyFocusUseCase {
  execute(userId: string, date: string, taskIds: string[]): Promise<DailyFocusResponseDto>;
}

export interface IGetDailyFocusUseCase {
  execute(userId: string, date?: string): Promise<DailyFocusResponseDto>;
}

export interface IToggleDailyFocusTaskUseCase {
  execute(userId: string, taskId: string, date?: string): Promise<DailyFocusResponseDto>;
}

export interface IGetDailyScheduleUseCase {
  execute(userId: string, date?: string): Promise<DailyScheduleResponseDto>;
}

export interface IGetActivityTimelineUseCase {
  execute(userId: string, limit?: number): Promise<ActivityTimelineResponseDto>;
}
