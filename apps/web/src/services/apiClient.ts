import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  DailyFocusResponseDto,
  DailyScheduleResponseDto,
  ActivityTimelineResponseDto,
  ConnectorSyncResultDto,
  TaskStatus,
  Priority,
  ProjectStatus,
  ProjectHealthStatus,
  ScheduleBlockType,
  SourceType
} from '@personal-os/types';

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
  : 'http://localhost:4000';

// In-browser fallback state when backend is disconnected
let mockProjects: Project[] = [
  {
    id: 'proj-1',
    userId: 'u-1',
    name: 'Personal OS — Productivity Core',
    description: 'Precision operational layer and daily decision support platform for engineers.',
    status: ProjectStatus.ACTIVE,
    deadline: new Date('2026-09-30'),
    tags: ['Architecture', 'TypeScript', 'Next.js'],
    health: {
      progressScore: 85,
      momentumScore: 90,
      scheduleRiskScore: 15,
      blockerRiskScore: 10,
      overallScore: 88,
      status: ProjectHealthStatus.EXCELLENT,
      lastCalculatedAt: new Date(),
      breakdown: {
        totalTasks: 8,
        completedTasks: 6,
        inProgressTasks: 2,
        blockedTasks: 0,
        overdueTasks: 0,
        bottleneckPrs: 0
      }
    },
    createdAt: new Date('2026-08-20'),
    updatedAt: new Date()
  },
  {
    id: 'proj-2',
    userId: 'u-1',
    name: 'AI Intelligence & Semantic Search',
    description: 'RAG pipeline, pgvector similarity and explainable recommendation engine.',
    status: ProjectStatus.ACTIVE,
    deadline: new Date('2026-10-15'),
    tags: ['AI', 'Vector', 'pgvector'],
    health: {
      progressScore: 35,
      momentumScore: 40,
      scheduleRiskScore: 25,
      blockerRiskScore: 30,
      overallScore: 62,
      status: ProjectHealthStatus.HEALTHY,
      lastCalculatedAt: new Date(),
      breakdown: {
        totalTasks: 6,
        completedTasks: 2,
        inProgressTasks: 3,
        blockedTasks: 1,
        overdueTasks: 0,
        bottleneckPrs: 1
      }
    },
    createdAt: new Date('2026-08-22'),
    updatedAt: new Date()
  }
];

let mockTasks: Task[] = [
  {
    id: 'task-101',
    userId: 'u-1',
    projectId: 'proj-1',
    title: 'Review Clean Architecture Data Contracts & DTOs',
    description: 'Verify strict typing and invariant boundaries in packages/types.',
    status: TaskStatus.COMPLETED,
    priority: Priority.HIGH,
    dueAt: new Date(),
    estimatedDurationMinutes: 60,
    actualDurationMinutes: 45,
    cognitiveLoad: 4,
    source: {
      type: SourceType.GITHUB,
      externalReferenceId: 'PR #101',
      externalUrl: 'https://github.com/hoandk203/Personal-OS/pull/101'
    },
    completedAt: new Date(),
    createdAt: new Date('2026-08-24'),
    updatedAt: new Date()
  },
  {
    id: 'task-102',
    userId: 'u-1',
    projectId: 'proj-1',
    title: 'Implement Interactive Kanban Board with Drag & Drop',
    description: 'Create responsive visual kanban columns with status transitions.',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    dueAt: new Date(),
    estimatedDurationMinutes: 90,
    actualDurationMinutes: null,
    cognitiveLoad: 3,
    source: {
      type: SourceType.MANUAL,
      externalReferenceId: null,
      externalUrl: null
    },
    completedAt: null,
    createdAt: new Date('2026-08-24'),
    updatedAt: new Date()
  },
  {
    id: 'task-103',
    userId: 'u-1',
    projectId: 'proj-1',
    title: 'Deploy GitHub Connector & Google Calendar Sync Adapters',
    description: 'Sync external commits, PR bottleneck alerts and meeting schedules.',
    status: TaskStatus.PLANNED,
    priority: Priority.URGENT,
    dueAt: new Date(Date.now() + 86400000),
    estimatedDurationMinutes: 120,
    actualDurationMinutes: null,
    cognitiveLoad: 5,
    source: {
      type: SourceType.GITHUB,
      externalReferenceId: 'PR #98',
      externalUrl: 'https://github.com/hoandk203/Personal-OS/pull/98'
    },
    completedAt: null,
    createdAt: new Date('2026-08-24'),
    updatedAt: new Date()
  },
  {
    id: 'task-104',
    userId: 'u-1',
    projectId: 'proj-2',
    title: 'Benchmark pgvector Cosine Distance Query Latency',
    description: 'Measure execution time for 1536-dim vector searches under high load.',
    status: TaskStatus.INBOX,
    priority: Priority.MEDIUM,
    dueAt: new Date(Date.now() + 172800000),
    estimatedDurationMinutes: 45,
    actualDurationMinutes: null,
    cognitiveLoad: 2,
    source: {
      type: SourceType.MANUAL,
      externalReferenceId: null,
      externalUrl: null
    },
    completedAt: null,
    createdAt: new Date('2026-08-24'),
    updatedAt: new Date()
  }
];

let mockFocusTaskIds = ['task-101', 'task-102', 'task-103'];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pos_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>)
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    // If backend is unreachable in local dev, seamlessly fallback to rich client-side mock
    console.warn(`API request to ${path} failed, using local mock state:`, error);
    return fallbackHandler<T>(path, options);
  }
}

function fallbackHandler<T>(path: string, options: RequestInit): T {
  const today = new Date().toISOString().split('T')[0];

  if (path.startsWith('/api/v1/projects')) {
    if (options.method === 'POST') {
      const body = JSON.parse(options.body as string) as CreateProjectDto;
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        userId: 'u-1',
        name: body.name,
        description: body.description ?? null,
        status: ProjectStatus.ACTIVE,
        deadline: body.deadline ? new Date(body.deadline) : null,
        tags: body.tags ?? [],
        health: {
          progressScore: 0,
          momentumScore: 10,
          scheduleRiskScore: 0,
          blockerRiskScore: 15,
          overallScore: 50,
          status: ProjectHealthStatus.HEALTHY,
          lastCalculatedAt: new Date(),
          breakdown: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, blockedTasks: 0, overdueTasks: 0, bottleneckPrs: 0 }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockProjects.unshift(newProj);
      return newProj as unknown as T;
    }
    return mockProjects as unknown as T;
  }

  if (path.startsWith('/api/v1/tasks')) {
    if (options.method === 'POST' && path.endsWith('/transition')) {
      const id = path.split('/')[4];
      const body = JSON.parse(options.body as string);
      const task = mockTasks.find(t => t.id === id);
      if (task) {
        task.status = body.status;
        task.completedAt = body.status === TaskStatus.COMPLETED ? new Date() : null;
        task.updatedAt = new Date();
      }
      return task as unknown as T;
    }

    if (options.method === 'POST') {
      const body = JSON.parse(options.body as string) as CreateTaskDto;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        userId: 'u-1',
        projectId: body.projectId ?? null,
        title: body.title,
        description: body.description ?? null,
        status: TaskStatus.INBOX,
        priority: body.priority ?? Priority.MEDIUM,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        estimatedDurationMinutes: body.estimatedDurationMinutes ?? null,
        actualDurationMinutes: null,
        cognitiveLoad: body.cognitiveLoad ?? 1,
        source: {
          type: body.source?.type ?? SourceType.MANUAL,
          externalReferenceId: body.source?.externalReferenceId ?? null,
          externalUrl: body.source?.externalUrl ?? null
        },
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockTasks.unshift(newTask);
      return newTask as unknown as T;
    }
    return mockTasks as unknown as T;
  }

  if (path.startsWith('/api/v1/today/focus')) {
    const tasks = mockTasks.filter(t => mockFocusTaskIds.includes(t.id));
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    return {
      date: today,
      focusTaskIds: mockFocusTaskIds,
      completedTaskIds: completedTasks.map(t => t.id),
      tasks,
      completedCount: completedTasks.length,
      totalCount: tasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    } as unknown as T;
  }

  if (path.startsWith('/api/v1/today/schedule')) {
    return {
      date: today,
      blocks: [
        {
          id: 'sb-1',
          type: ScheduleBlockType.FREE_SLOT,
          title: 'Morning Planning & Inbox Zero',
          startTime: '09:00',
          endTime: '10:00',
          durationMinutes: 60
        },
        {
          id: 'sb-2',
          type: ScheduleBlockType.MEETING,
          title: 'Daily Architecture & Sprint Sync',
          startTime: '10:00',
          endTime: '10:45',
          durationMinutes: 45,
          metadata: { hangoutLink: 'https://meet.google.com/xyz-core-pos' }
        },
        {
          id: 'sb-3',
          type: ScheduleBlockType.DEEP_WORK,
          title: 'Focus: Review Clean Architecture Data Contracts',
          startTime: '10:45',
          endTime: '14:00',
          durationMinutes: 195,
          isFocusBlock: true
        },
        {
          id: 'sb-4',
          type: ScheduleBlockType.MEETING,
          title: 'Deep Work Alignment & Code Review',
          startTime: '14:00',
          endTime: '15:00',
          durationMinutes: 60,
          metadata: { hangoutLink: 'https://meet.google.com/abc-arch-rev' }
        },
        {
          id: 'sb-5',
          type: ScheduleBlockType.DEEP_WORK,
          title: 'Deep Work Block: Testing & Verification',
          startTime: '15:00',
          endTime: '18:00',
          durationMinutes: 180,
          isFocusBlock: true
        }
      ],
      totalMeetingMinutes: 105,
      totalDeepWorkMinutes: 375,
      totalFreeMinutes: 60
    } as unknown as T;
  }

  if (path.startsWith('/api/v1/today/timeline')) {
    return {
      items: [
        {
          id: 'act-1',
          type: 'github.commit.created',
          title: 'Git Commit in Personal-OS',
          description: 'feat: implement core domain entities and use cases',
          source: SourceType.GITHUB,
          timestamp: new Date()
        },
        {
          id: 'act-2',
          type: 'task.status_changed',
          title: 'Task: Review Data Contracts',
          description: 'Status moved to COMPLETED',
          source: SourceType.MANUAL,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 'act-3',
          type: 'github.pull_request.bottleneck',
          title: 'GitHub PR #98 Bottleneck Alert',
          description: 'PR waiting for review > 28h (High schedule risk)',
          source: SourceType.GITHUB,
          timestamp: new Date(Date.now() - 7200000)
        }
      ],
      total: 3
    } as unknown as T;
  }

  if (path.startsWith('/api/v1/connectors/github/sync')) {
    return {
      source: SourceType.GITHUB,
      success: true,
      itemsSynced: 5,
      warnings: ['PR #98 "refactor: Token encryption" has been open for 28h without review.'],
      syncedAt: new Date().toISOString(),
      summary: { commitsCount: 2, openPrsCount: 2, bottleneckPrsCount: 1, issuesCount: 1 }
    } as unknown as T;
  }

  if (path.startsWith('/api/v1/connectors/calendar/sync')) {
    return {
      source: SourceType.GOOGLE_CALENDAR,
      success: true,
      itemsSynced: 2,
      warnings: [],
      syncedAt: new Date().toISOString(),
      summary: { date: today, totalMeetingsCount: 2, totalMeetingMinutes: 105, freeSlotsCount: 3, totalFreeMinutes: 435 }
    } as unknown as T;
  }

  return {} as unknown as T;
}

export const api = {
  // Tasks API
  getTasks: (params?: Record<string, string | number | boolean>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<Task[]>(`/api/v1/tasks${qs}`);
  },
  createTask: (dto: CreateTaskDto) => request<Task>('/api/v1/tasks', { method: 'POST', body: JSON.stringify(dto) }),
  updateTask: (id: string, dto: UpdateTaskDto) => request<Task>(`/api/v1/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  transitionTaskStatus: (id: string, status: TaskStatus, reason?: string) =>
    request<Task>(`/api/v1/tasks/${id}/transition`, { method: 'POST', body: JSON.stringify({ status, reason }) }),
  deleteTask: (id: string) => request<{ id: string; deleted: boolean }>(`/api/v1/tasks/${id}`, { method: 'DELETE' }),

  // Projects API
  getProjects: (status?: ProjectStatus) => {
    const qs = status ? `?status=${status}` : '';
    return request<Project[]>(`/api/v1/projects${qs}`);
  },
  getProjectById: (id: string) => request<Project>(`/api/v1/projects/${id}`),
  createProject: (dto: CreateProjectDto) => request<Project>('/api/v1/projects', { method: 'POST', body: JSON.stringify(dto) }),
  updateProject: (id: string, dto: UpdateProjectDto) => request<Project>(`/api/v1/projects/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  deleteProject: (id: string) => request<{ id: string; deleted: boolean }>(`/api/v1/projects/${id}`, { method: 'DELETE' }),
  calculateProjectHealth: (id: string) => request<any>(`/api/v1/projects/${id}/calculate-health`, { method: 'POST' }),

  // Today API
  getDailyFocus: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<DailyFocusResponseDto>(`/api/v1/today/focus${qs}`);
  },
  setDailyFocus: (taskIds: string[], date?: string) =>
    request<DailyFocusResponseDto>('/api/v1/today/focus', { method: 'POST', body: JSON.stringify({ taskIds, date }) }),
  toggleDailyFocusTask: (taskId: string, date?: string) =>
    request<DailyFocusResponseDto>('/api/v1/today/focus/toggle', { method: 'POST', body: JSON.stringify({ taskId, date }) }),
  getDailySchedule: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<DailyScheduleResponseDto>(`/api/v1/today/schedule${qs}`);
  },
  getActivityTimeline: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : '';
    return request<ActivityTimelineResponseDto>(`/api/v1/today/timeline${qs}`);
  },

  // Connectors API
  syncGitHub: (options?: { mockFallback?: boolean; token?: string }) =>
    request<ConnectorSyncResultDto>('/api/v1/connectors/github/sync', { method: 'POST', body: JSON.stringify(options || {}) }),
  syncCalendar: (date?: string, options?: { mockFallback?: boolean; token?: string }) =>
    request<ConnectorSyncResultDto>('/api/v1/connectors/calendar/sync', { method: 'POST', body: JSON.stringify({ date, ...options }) })
};
