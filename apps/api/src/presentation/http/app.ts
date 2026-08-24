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

// Repositories & Services
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/in-memory-user.repository.js';
import { InMemoryTaskRepository } from '../../infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { InMemoryProjectRepository } from '../../infrastructure/persistence/in-memory/in-memory-project.repository.js';
import { InMemoryEventRepository } from '../../infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { InMemoryAuditLogRepository } from '../../infrastructure/persistence/in-memory/in-memory-audit-log.repository.js';
import { EventEmitterBusAdapter } from '../../infrastructure/events/event-emitter-bus.adapter.js';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service.js';
import { TaskCreatedEvent } from '../../core/domain/events/domain-events.js';

// Use Cases
import { RegisterUserUseCase } from '../../core/application/use-cases/auth/register-user.use-case.js';
import { AuthenticateUserUseCase } from '../../core/application/use-cases/auth/authenticate-user.use-case.js';
import { CreateTaskUseCase } from '../../core/application/use-cases/tasks/create-task.use-case.js';
import { UpdateTaskUseCase } from '../../core/application/use-cases/tasks/update-task.use-case.js';
import { ListTasksUseCase, DeleteTaskUseCase } from '../../core/application/use-cases/tasks/list-tasks.use-case.js';
import { CreateProjectUseCase, UpdateProjectUseCase } from '../../core/application/use-cases/projects/create-project.use-case.js';
import { CalculateProjectHealthUseCase } from '../../core/application/use-cases/projects/calculate-project-health.use-case.js';
import { IngestEventUseCase } from '../../core/application/use-cases/events/ingest-event.use-case.js';
import { RecordAuditLogUseCase, QueryAuditLogsUseCase } from '../../core/application/use-cases/audit/record-audit-log.use-case.js';

export interface AppContainer {
  userRepo: InMemoryUserRepository;
  taskRepo: InMemoryTaskRepository;
  projectRepo: InMemoryProjectRepository;
  eventRepo: InMemoryEventRepository;
  auditRepo: InMemoryAuditLogRepository;
  eventBus: EventEmitterBusAdapter;
  tokenService: JwtTokenService;
}

export function createApplication(customContainer?: Partial<AppContainer>): { app: Express; container: AppContainer } {
  const container: AppContainer = {
    userRepo: customContainer?.userRepo ?? new InMemoryUserRepository(),
    taskRepo: customContainer?.taskRepo ?? new InMemoryTaskRepository(),
    projectRepo: customContainer?.projectRepo ?? new InMemoryProjectRepository(),
    eventRepo: customContainer?.eventRepo ?? new InMemoryEventRepository(),
    auditRepo: customContainer?.auditRepo ?? new InMemoryAuditLogRepository(),
    eventBus: customContainer?.eventBus ?? new EventEmitterBusAdapter(),
    tokenService: customContainer?.tokenService ?? new JwtTokenService()
  };

  // Wire Use Cases
  const registerUseCase = new RegisterUserUseCase(container.userRepo, container.tokenService);
  const authUseCase = new AuthenticateUserUseCase(container.userRepo, container.tokenService);

  const createTaskUseCase = new CreateTaskUseCase(container.taskRepo, container.eventBus);
  const updateTaskUseCase = new UpdateTaskUseCase(container.taskRepo, container.eventBus);
  const listTasksUseCase = new ListTasksUseCase(container.taskRepo);
  const deleteTaskUseCase = new DeleteTaskUseCase(container.taskRepo);

  const createProjectUseCase = new CreateProjectUseCase(container.projectRepo, container.eventBus);
  const updateProjectUseCase = new UpdateProjectUseCase(container.projectRepo);
  const calculateHealthUseCase = new CalculateProjectHealthUseCase(container.projectRepo, container.taskRepo);

  const ingestEventUseCase = new IngestEventUseCase(container.eventRepo);
  const recordAuditLogUseCase = new RecordAuditLogUseCase(container.auditRepo);
  const queryAuditLogsUseCase = new QueryAuditLogsUseCase(container.auditRepo);

  // Hook audit log to domain events
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

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Public Routes
  app.use('/health', createHealthRoutes());
  app.use('/api/v1/auth', createAuthRoutes(registerUseCase, authUseCase));

  // Protected Routes
  const authMiddleware = createAuthMiddleware(container.tokenService);
  app.use('/api/v1/tasks', authMiddleware as any, createTaskRoutes(createTaskUseCase, updateTaskUseCase, listTasksUseCase, deleteTaskUseCase));
  app.use('/api/v1/projects', authMiddleware as any, createProjectRoutes(createProjectUseCase, updateProjectUseCase, calculateHealthUseCase, container.projectRepo));
  app.use('/api/v1/events', authMiddleware as any, createEventRoutes(ingestEventUseCase, container.eventRepo));
  app.use('/api/v1/audit-logs', authMiddleware as any, createAuditLogRoutes(queryAuditLogsUseCase));

  // Global Error Handler Middleware (must be after routes)
  app.use(errorHandlerMiddleware as any);

  return { app, container };
}
