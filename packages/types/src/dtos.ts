import { TaskStatus, Priority, ProjectStatus, SourceType, ActorType, NotificationTier } from './enums.js';

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  dueAt?: string; // ISO date string
  estimatedDurationMinutes?: number;
  cognitiveLoad?: number; // 1-5
  source?: {
    type: SourceType;
    externalReferenceId?: string;
    externalUrl?: string;
  };
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueAt?: string;
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;
  cognitiveLoad?: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  deadline?: string;
  tags?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  deadline?: string;
  tags?: string[];
}

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface IngestEventDto {
  type: string;
  source: SourceType;
  sourceId: string;
  payload: Record<string, unknown>;
  occurredAt?: string;
}

export interface CreateAuditLogDto {
  userId: string;
  actor: ActorType;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
}

export interface QueryAuditLogsDto {
  userId: string;
  resource?: string;
  actor?: ActorType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
