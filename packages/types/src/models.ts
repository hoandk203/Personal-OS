import { TaskStatus, Priority, ProjectStatus, NotificationTier, RecommendationType, SourceType, ActorType } from './enums.js';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectHealth {
  progressScore: number;       // 0 - 100
  momentumScore: number;       // 0 - 100
  scheduleRiskScore: number;   // 0 - 100
  blockerRiskScore: number;    // 0 - 100
  lastCalculatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  deadline: Date | null;
  tags: string[];
  health: ProjectHealth | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSource {
  type: SourceType;
  externalReferenceId: string | null;
  externalUrl: string | null;
}

export interface Task {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueAt: Date | null;
  estimatedDurationMinutes: number | null;
  actualDurationMinutes: number | null;
  cognitiveLoad: number | null; // 1 to 5
  source: TaskSource;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedEvent {
  id: string;
  userId: string;
  type: string;                 // e.g. "github.pull_request.merged"
  source: SourceType;
  sourceId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  receivedAt: Date;
  processedAt: Date | null;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  reason: string;
  evidence: string[];
  confidence: number;          // 0.0 - 1.0
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedAction: Record<string, unknown> | null;
  requiresConfirmation: boolean;
  isApplied: boolean;
  createdAt: Date;
}

export interface Decision {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  context: string;
  options: string[];
  chosenOption: string;
  reason: string;
  assumptions: string[];
  confidence: number;          // 0.0 - 1.0
  expectedOutcome: string;
  successCriteria: string[];
  decisionDate: Date;
  reviewDate: Date | null;
  actualOutcome: string | null;
  evaluation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  tier: NotificationTier;
  title: string;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  actor: ActorType;
  action: string;
  resource: string;
  resourceId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  timestamp: Date;
}

export interface Integration {
  id: string;
  userId: string;
  provider: SourceType;
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: Date | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  isActive: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
