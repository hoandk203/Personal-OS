import { ConnectorSyncResultDto } from '@personal-os/types';

export interface ISyncGitHubActivityUseCase {
  execute(userId: string, options?: { mockFallback?: boolean; token?: string }): Promise<ConnectorSyncResultDto>;
}

export interface ISyncCalendarScheduleUseCase {
  execute(userId: string, date?: string, options?: { mockFallback?: boolean; token?: string }): Promise<ConnectorSyncResultDto>;
}
