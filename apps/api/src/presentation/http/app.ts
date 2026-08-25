import express, { Express } from 'express';
import cors from 'cors';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { createHealthRoutes } from './routes/health.routes.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createTaskRoutes } from './routes/task.routes.js';
import { createProjectRoutes } from './routes/project.routes.js';
import { createEventRoutes } from './routes/event.routes.js';
import { createAuditLogRoutes } from './routes/audit-log.routes.js';
import { createTodayRoutes } from './routes/today.routes.js';
import { createConnectorRoutes } from './routes/connector.routes.js';

// Repositories & Services
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/in-memory-user.repository.js';
import { InMemoryTaskRepository } from '../../infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { InMemoryProjectRepository } from '../../infrastructure/persistence/in-memory/in-memory-project.repository.js';
import { InMemoryEventRepository } from '../../infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { InMemoryAuditLogRepository } from '../../infrastructure/persistence/in-memory/in-memory-audit-log.repository.js';
import { InMemoryDailyFocusRepository } from '../../infrastructure/persistence/in-memory/in-memory-daily-focus.repository.js';
import { EventEmitterBusAdapter } from '../../infrastructure/events/event-emitter-bus.adapter.js';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service.js';
import { GitHubConnectorAdapter } from '../../infrastructure/connectors/github-connector.adapter.js';
import { GoogleCalendarConnectorAdapter } from '../../infrastructure/connectors/google-calendar-connector.adapter.js';
import { TaskCreatedEvent, TaskStatusChangedEvent, DailyFocusSetEvent } from '../../core/domain/events/domain-events.js';

// Use Cases
import { RegisterUserUseCase } from '../../core/application/use-cases/auth/register-user.use-case.js';
import { AuthenticateUserUseCase } from '../../core/application/use-cases/auth/authenticate-user.use-case.js';
import { CreateTaskUseCase } from '../../core/application/use-cases/tasks/create-task.use-case.js';
import { UpdateTaskUseCase } from '../../core/application/use-cases/tasks/update-task.use-case.js';
import { ListTasksUseCase, DeleteTaskUseCase } from '../../core/application/use-cases/tasks/list-tasks.use-case.js';
import { TransitionTaskStatusUseCase } from '../../core/application/use-cases/tasks/transition-task-status.use-case.js';
import { CreateProjectUseCase, UpdateProjectUseCase, ListProjectsUseCase, GetProjectByIdUseCase, DeleteProjectUseCase } from '../../core/application/use-cases/projects/create-project.use-case.js';
import { CalculateProjectHealthUseCase } from '../../core/application/use-cases/projects/calculate-project-health.use-case.js';
import { IngestEventUseCase } from '../../core/application/use-cases/events/ingest-event.use-case.js';
import { RecordAuditLogUseCase, QueryAuditLogsUseCase } from '../../core/application/use-cases/audit/record-audit-log.use-case.js';
import { SyncGitHubActivityUseCase } from '../../core/application/use-cases/connectors/sync-github-activity.use-case.js';
import { SyncCalendarScheduleUseCase } from '../../core/application/use-cases/connectors/sync-calendar-schedule.use-case.js';
import { SetDailyFocusUseCase, GetDailyFocusUseCase, ToggleDailyFocusTaskUseCase } from '../../core/application/use-cases/today/daily-focus.use-case.js';
import { GetDailyScheduleUseCase } from '../../core/application/use-cases/today/get-daily-schedule.use-case.js';
import { GetActivityTimelineUseCase } from '../../core/application/use-cases/today/get-activity-timeline.use-case.js';

export interface AppContainer {
  userRepo: InMemoryUserRepository;
  taskRepo: InMemoryTaskRepository;
  projectRepo: InMemoryProjectRepository;
  eventRepo: InMemoryEventRepository;
  auditRepo: InMemoryAuditLogRepository;
  dailyFocusRepo: InMemoryDailyFocusRepository;
  eventBus: EventEmitterBusAdapter;
  tokenService: JwtTokenService;
  githubConnector: GitHubConnectorAdapter;
  calendarConnector: GoogleCalendarConnectorAdapter;
}

export function createApplication(customContainer?: Partial<AppContainer>): { app: Express; container: AppContainer } {
  const container: AppContainer = {
    userRepo: customContainer?.userRepo ?? new InMemoryUserRepository(),
    taskRepo: customContainer?.taskRepo ?? new InMemoryTaskRepository(),
    projectRepo: customContainer?.projectRepo ?? new InMemoryProjectRepository(),
    eventRepo: customContainer?.eventRepo ?? new InMemoryEventRepository(),
    auditRepo: customContainer?.auditRepo ?? new InMemoryAuditLogRepository(),
    dailyFocusRepo: customContainer?.dailyFocusRepo ?? new InMemoryDailyFocusRepository(),
    eventBus: customContainer?.eventBus ?? new EventEmitterBusAdapter(),
    tokenService: customContainer?.tokenService ?? new JwtTokenService(),
    githubConnector: customContainer?.githubConnector ?? new GitHubConnectorAdapter(),
    calendarConnector: customContainer?.calendarConnector ?? new GoogleCalendarConnectorAdapter()
  };

  // Wire Use Cases
  const registerUseCase = new RegisterUserUseCase(container.userRepo, container.tokenService);
  const authUseCase = new AuthenticateUserUseCase(container.userRepo, container.tokenService);

  const createTaskUseCase = new CreateTaskUseCase(container.taskRepo, container.eventBus);
  const updateTaskUseCase = new UpdateTaskUseCase(container.taskRepo, container.eventBus);
  const listTasksUseCase = new ListTasksUseCase(container.taskRepo);
  const deleteTaskUseCase = new DeleteTaskUseCase(container.taskRepo);
  const transitionTaskStatusUseCase = new TransitionTaskStatusUseCase(container.taskRepo, container.eventBus);

  const createProjectUseCase = new CreateProjectUseCase(container.projectRepo, container.eventBus);
  const updateProjectUseCase = new UpdateProjectUseCase(container.projectRepo);
  const calculateHealthUseCase = new CalculateProjectHealthUseCase(container.projectRepo, container.taskRepo);
  const listProjectsUseCase = new ListProjectsUseCase(container.projectRepo);
  const getProjectByIdUseCase = new GetProjectByIdUseCase(container.projectRepo);
  const deleteProjectUseCase = new DeleteProjectUseCase(container.projectRepo);

  const ingestEventUseCase = new IngestEventUseCase(container.eventRepo);
  const recordAuditLogUseCase = new RecordAuditLogUseCase(container.auditRepo);
  const queryAuditLogsUseCase = new QueryAuditLogsUseCase(container.auditRepo);

  const syncGitHubUseCase = new SyncGitHubActivityUseCase(container.githubConnector, container.eventRepo);
  const syncCalendarUseCase = new SyncCalendarScheduleUseCase(container.calendarConnector, container.eventRepo);

  const setDailyFocusUseCase = new SetDailyFocusUseCase(container.dailyFocusRepo, container.taskRepo, container.eventBus);
  const getDailyFocusUseCase = new GetDailyFocusUseCase(container.dailyFocusRepo, container.taskRepo);
  const toggleDailyFocusTaskUseCase = new ToggleDailyFocusTaskUseCase(container.dailyFocusRepo, container.taskRepo, setDailyFocusUseCase);
  const getDailyScheduleUseCase = new GetDailyScheduleUseCase(container.calendarConnector, container.dailyFocusRepo, container.taskRepo);
  const getActivityTimelineUseCase = new GetActivityTimelineUseCase(container.eventRepo, container.taskRepo);

  // Hook audit log & events
  container.eventBus.subscribe<TaskCreatedEvent>('task.created', async (e: TaskCreatedEvent) => {
    await recordAuditLogUseCase.execute({
      userId: e.userId,
      actor: 'USER' as any,
      action: 'TASK_CREATED',
      resource: 'Task',
      resourceId: e.aggregateId,
      after: { title: e.title, priority: e.priority }
    });
  });

  container.eventBus.subscribe<TaskStatusChangedEvent>('task.status_changed', async (e: TaskStatusChangedEvent) => {
    await recordAuditLogUseCase.execute({
      userId: e.userId,
      actor: 'USER' as any,
      action: 'TASK_STATUS_CHANGED',
      resource: 'Task',
      resourceId: e.aggregateId,
      before: { status: e.oldStatus },
      after: { status: e.newStatus },
      reason: e.reason
    });
  });

  container.eventBus.subscribe<DailyFocusSetEvent>('daily_focus.set', async (e: DailyFocusSetEvent) => {
    await recordAuditLogUseCase.execute({
      userId: e.userId,
      actor: 'USER' as any,
      action: 'DAILY_FOCUS_SET',
      resource: 'DailyFocus',
      resourceId: e.aggregateId,
      after: { date: e.date, taskIds: e.taskIds }
    });
  });

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Public Routes
  app.use('/health', createHealthRoutes());
  app.use('/api/v1/auth', createAuthRoutes(registerUseCase, authUseCase));

  // Protected Routes
  const authMiddleware = createAuthMiddleware(container.tokenService);
  app.use(
    '/api/v1/tasks',
    authMiddleware as any,
    createTaskRoutes(createTaskUseCase, updateTaskUseCase, listTasksUseCase, deleteTaskUseCase, transitionTaskStatusUseCase)
  );
  app.use(
    '/api/v1/projects',
    authMiddleware as any,
    createProjectRoutes(createProjectUseCase, updateProjectUseCase, calculateHealthUseCase, container.projectRepo)
  );
  app.use(
    '/api/v1/today',
    authMiddleware as any,
    createTodayRoutes(
      setDailyFocusUseCase,
      getDailyFocusUseCase,
      toggleDailyFocusTaskUseCase,
      getDailyScheduleUseCase,
      getActivityTimelineUseCase
    )
  );
  app.use(
    '/api/v1/connectors',
    authMiddleware as any,
    createConnectorRoutes(syncGitHubUseCase, syncCalendarUseCase)
  );
  app.use('/api/v1/events', authMiddleware as any, createEventRoutes(ingestEventUseCase, container.eventRepo));
  app.use('/api/v1/audit-logs', authMiddleware as any, createAuditLogRoutes(queryAuditLogsUseCase));

  // Global Error Handler Middleware (must be after routes)
  app.use(errorHandlerMiddleware as any);

  return { app, container };
}
