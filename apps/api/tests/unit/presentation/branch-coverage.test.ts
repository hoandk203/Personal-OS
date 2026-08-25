import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApplication } from '../../../src/presentation/http/app.js';
import { JwtTokenService } from '../../../src/infrastructure/security/jwt-token.service.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { ProjectEntity } from '../../../src/core/domain/entities/project.entity.js';
import { AuditLogEntity } from '../../../src/core/domain/entities/audit-log.entity.js';
import { TaskStatus, Priority, ProjectStatus, SourceType, ActorType } from '@personal-os/types';
import jwt from 'jsonwebtoken';

describe('Branch Coverage Expansion Suite', () => {
  it('should test InMemoryTaskRepository with all filter branches (projectId, status, dueBefore)', async () => {
    const repo = new InMemoryTaskRepository();
    const task = new TaskEntity('t-1', 'u-1', 'p-1', 'Title', null, TaskStatus.INBOX, Priority.LOW, new Date(Date.now() + 100000));
    await repo.save(task);

    const matchProject = await repo.findMany({ userId: 'u-1', projectId: 'p-1' });
    expect(matchProject).toHaveLength(1);

    const nonMatchProject = await repo.findMany({ userId: 'u-1', projectId: 'p-other' });
    expect(nonMatchProject).toHaveLength(0);

    const matchStatus = await repo.findMany({ userId: 'u-1', status: TaskStatus.INBOX });
    expect(matchStatus).toHaveLength(1);

    const matchDue = await repo.findMany({ userId: 'u-1', dueBefore: new Date(Date.now() + 500000) });
    expect(matchDue).toHaveLength(1);
  });

  it('should test JwtTokenService missing userId or email in payload', () => {
    const service = new JwtTokenService('secret', 'refresh-secret');
    const tokenNoUserId = jwt.sign({ email: 'test@example.com' }, 'secret');
    expect(() => service.verifyAccessToken(tokenNoUserId)).toThrow();

    const refreshTokenNoEmail = jwt.sign({ userId: 'u-1' }, 'refresh-secret');
    expect(() => service.verifyRefreshToken(refreshTokenNoEmail)).toThrow();
  });

  it('should test task and project routes with all optional DTO fields', async () => {
    const { app, container } = createApplication();

    // Register user
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'branches@test.local', password: 'Password123!', name: 'Branch User' });
    const token = regRes.body.data.tokens.accessToken;
    const userId = regRes.body.data.user.id;

    // Create project with description, deadline, tags
    const projRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Full Project',
        description: 'Detailed description',
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        tags: ['important', 'v1']
      });
    const projId = projRes.body.data.id;

    // Update project with all fields
    const updateProjRes = await request(app)
      .patch(`/api/v1/projects/${projId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Renamed Project',
        description: 'New desc',
        status: 'COMPLETED',
        deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
        tags: ['completed']
      });
    // Note: patch route on projects if not existing or directly via usecase
    const updateProjectUseCase = container.projectRepo;
    const p = await updateProjectUseCase.findById(projId, userId);
    if (p) {
      p.description = 'Updated desc';
      p.tags = ['updated'];
      await updateProjectUseCase.save(p);
    }

    // Create task with all fields
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Full Task',
        description: 'Task description',
        projectId: projId,
        priority: 'URGENT',
        dueAt: new Date(Date.now() + 86400000).toISOString(),
        estimatedDurationMinutes: 60,
        cognitiveLoad: 4,
        source: {
          type: 'GITHUB',
          externalReferenceId: 'PR-10',
          externalUrl: 'https://github.com/pr/10'
        }
      });
    const taskId = taskRes.body.data.id;

    // Update task with all optional fields
    const updateTaskRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Full Task',
        description: 'New task desc',
        projectId: projId,
        priority: 'LOW',
        dueAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        estimatedDurationMinutes: 90,
        actualDurationMinutes: 80,
        cognitiveLoad: 2,
        status: 'PLANNED'
      });
    expect(updateTaskRes.status).toBe(200);

    // Ingest event with occurredAt
    const eventRes = await request(app)
      .post('/api/v1/events/ingest')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'custom.event',
        source: 'MANUAL',
        sourceId: 'custom-1',
        payload: { test: true },
        occurredAt: new Date().toISOString()
      });
    expect(eventRes.status).toBe(201);

    // Ingest event validation failures
    await request(app).post('/api/v1/events/ingest').set('Authorization', `Bearer ${token}`).send({ source: 'MANUAL', sourceId: '1' }).expect(422);
    await request(app).post('/api/v1/events/ingest').set('Authorization', `Bearer ${token}`).send({ type: 'x', sourceId: '1' }).expect(422);
    await request(app).post('/api/v1/events/ingest').set('Authorization', `Bearer ${token}`).send({ type: 'x', source: 'MANUAL' }).expect(422);

    // Auth route validation failures
    await request(app).post('/api/v1/auth/register').send({ email: 'a@b.c', password: 'p' }).expect(422);
    await request(app).post('/api/v1/auth/register').send({ password: 'p', name: 'n' }).expect(422);
    await request(app).post('/api/v1/auth/login').send({ password: 'p' }).expect(422);

    // Project route validation failure
    await request(app).post('/api/v1/projects').set('Authorization', `Bearer ${token}`).send({}).expect(422);

    // Project update with null deadline
    const updateNullProj = await request(app)
      .patch(`/api/v1/projects/${projId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ deadline: undefined });
    expect(updateNullProj.status).toBe(200);

    // Task update with dueAt null
    const updateNullTask = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dueAt: undefined });
    expect(updateNullTask.status).toBe(200);

    // Query audit logs with pagination params
    const auditRes = await request(app)
      .get('/api/v1/audit-logs?limit=10&offset=0&resource=Task')
      .set('Authorization', `Bearer ${token}`);
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.meta.limit).toBe(10);
    expect(auditRes.body.meta.offset).toBe(0);

    // Event recent with limit
    const eventRecentRes = await request(app)
      .get('/api/v1/events/recent?limit=5')
      .set('Authorization', `Bearer ${token}`);
    expect(eventRecentRes.status).toBe(200);

    // Auth middleware malformed token triggering catch
    await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', 'Bearer invalid-token-string-xyz')
      .expect(401);

    // Record audit log with all optional fields omitted
    const minimalAudit = await container.auditRepo.save(new AuditLogEntity(
      'a-min',
      userId,
      ActorType.USER,
      'MINIMAL_ACTION',
      'Task'
    ));
    expect(minimalAudit.id).toBe('a-min');
  });
});

describe('Phase 1 Detailed Branch Coverage Suite', () => {
  it('should test ProjectHealthVO constructor with explicit overallScore and status', async () => {
    const { ProjectHealthVO } = await import('../../../src/core/domain/value-objects/project-health.vo.js');
    const customHealth = new ProjectHealthVO({
      progressScore: 80,
      momentumScore: 80,
      scheduleRiskScore: 20,
      blockerRiskScore: 20,
      overallScore: 92,
      status: 'EXCELLENT' as any
    });
    expect(customHealth.overallScore).toBe(92);
    expect(customHealth.getOverallHealthStatus()).toBe('EXCELLENT');
  });

  it('should test InMemoryTaskRepository count functions and delete non-existing task', async () => {
    const repo = new InMemoryTaskRepository();
    const task = new TaskEntity('t-c1', 'u-1', 'p-1', 'Count Task', null, TaskStatus.COMPLETED);
    await repo.save(task);

    const completed = await repo.countCompletedByProject('p-1', 'u-1');
    expect(completed).toBe(1);

    const total = await repo.countTotalByProject('p-1', 'u-1');
    expect(total).toBe(1);

    const deleted = await repo.delete('non-existent', 'u-1');
    expect(deleted).toBe(false);
  });

  it('should test router error handlers with mock throwing use cases', async () => {
    const throwingUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('Simulated route failure'))
    };

    const { createTaskRoutes } = await import('../../../src/presentation/http/routes/task.routes.js');
    const { createProjectRoutes } = await import('../../../src/presentation/http/routes/project.routes.js');
    const { createTodayRoutes } = await import('../../../src/presentation/http/routes/today.routes.js');
    const { createConnectorRoutes } = await import('../../../src/presentation/http/routes/connector.routes.js');
    const express = (await import('express')).default;
    const { errorHandlerMiddleware } = await import('../../../src/presentation/http/middlewares/error-handler.middleware.js');

    const app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req: any, _res: any, next: any) => {
      req.user = { userId: 'u-1', email: 'u1@test.com' };
      next();
    });

    app.use('/test/tasks', createTaskRoutes(
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any
    ));

    app.use('/test/projects', createProjectRoutes(
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any,
      {
        findMany: vi.fn().mockRejectedValue(new Error('err')),
        findById: vi.fn().mockRejectedValue(new Error('err')),
        save: vi.fn().mockRejectedValue(new Error('err')),
        delete: vi.fn().mockRejectedValue(new Error('err'))
      } as any
    ));

    app.use('/test/today', createTodayRoutes(
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any,
      throwingUseCase as any
    ));

    app.use('/test/connectors', createConnectorRoutes(
      throwingUseCase as any,
      throwingUseCase as any
    ));

    app.use(errorHandlerMiddleware as any);

    // Call routes to exercise catch blocks
    await request(app).post('/test/tasks').send({ title: 'T' }).expect(500);
    await request(app).get('/test/tasks').expect(500);
    await request(app).patch('/test/tasks/t-1').send({ title: 'New' }).expect(500);
    await request(app).post('/test/tasks/t-1/transition').send({ status: 'PLANNED' }).expect(500);
    await request(app).delete('/test/tasks/t-1').expect(500);

    await request(app).post('/test/projects').send({ name: 'P' }).expect(500);
    await request(app).get('/test/projects').expect(500);
    await request(app).patch('/test/projects/p-1').send({ name: 'New' }).expect(500);
    await request(app).get('/test/projects/p-1').expect(500);
    await request(app).post('/test/projects/p-1/calculate-health').expect(500);
    await request(app).delete('/test/projects/p-1').expect(500);

    await request(app).get('/test/today/focus').expect(500);
    await request(app).post('/test/today/focus').send({ taskIds: ['t-1'] }).expect(500);
    await request(app).post('/test/today/focus/toggle').send({ taskId: 't-1' }).expect(500);
    await request(app).get('/test/today/schedule').expect(500);
    await request(app).get('/test/today/timeline').expect(500);

    await request(app).post('/test/connectors/github/sync').send({}).expect(500);
    await request(app).post('/test/connectors/calendar/sync').send({}).expect(500);
  });

  it('should test activity timeline with minimal event payloads and fallback tasks with missing source', async () => {
    const { EventEntity } = await import('../../../src/core/domain/entities/event.entity.js');
    const { GetActivityTimelineUseCase } = await import('../../../src/core/application/use-cases/today/get-activity-timeline.use-case.js');
    const { InMemoryEventRepository } = await import('../../../src/infrastructure/persistence/in-memory/in-memory-event.repository.js');

    const eventRepo = new InMemoryEventRepository();
    // Events with minimal empty payload to test fallback string branches
    await eventRepo.save(new EventEntity('e-min-1', 'u-1', 'github.commit.created', SourceType.GITHUB, '1', {}));
    await eventRepo.save(new EventEntity('e-min-2', 'u-1', 'github.pull_request.opened', SourceType.GITHUB, '2', {}));
    await eventRepo.save(new EventEntity('e-min-3', 'u-1', 'calendar.meeting', SourceType.GOOGLE_CALENDAR, '3', {}));
    await eventRepo.save(new EventEntity('e-min-4', 'u-1', 'task.created', SourceType.MANUAL, '4', {}));

    const taskRepo = new InMemoryTaskRepository();
    // Task without explicit source
    const rawTask = new TaskEntity('t-raw', 'u-1', null, 'Raw Task', null, TaskStatus.INBOX);
    (rawTask as any).source = null;
    await taskRepo.save(rawTask);

    const timelineUseCase = new GetActivityTimelineUseCase(eventRepo, taskRepo);
    const res = await timelineUseCase.execute('u-1', 10);
    expect(res.items.length).toBe(5);
  });
});
