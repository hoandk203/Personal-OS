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
