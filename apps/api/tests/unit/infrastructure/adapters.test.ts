import { describe, it, expect, vi } from 'vitest';
import { InMemoryUserRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-user.repository.js';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-task.repository.js';
import { InMemoryProjectRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-project.repository.js';
import { InMemoryEventRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { InMemoryAuditLogRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-audit-log.repository.js';
import { InMemoryQueueAdapter } from '../../../src/infrastructure/queue/bullmq-queue.adapter.js';
import { EventEmitterBusAdapter } from '../../../src/infrastructure/events/event-emitter-bus.adapter.js';
import { UserEntity } from '../../../src/core/domain/entities/user.entity.js';
import { TaskEntity } from '../../../src/core/domain/entities/task.entity.js';
import { ProjectEntity } from '../../../src/core/domain/entities/project.entity.js';
import { EventEntity } from '../../../src/core/domain/entities/event.entity.js';
import { AuditLogEntity } from '../../../src/core/domain/entities/audit-log.entity.js';
import { DecisionEntity } from '../../../src/core/domain/entities/decision.entity.js';
import { TaskStatus, Priority, ProjectStatus, SourceType, ActorType } from '@personal-os/types';
import { DomainError } from '@personal-os/shared';
import { createApplication } from '../../../src/presentation/http/app.js';
import { errorHandlerMiddleware } from '../../../src/presentation/http/middlewares/error-handler.middleware.js';
import request from 'supertest';

describe('Infrastructure Adapters & Edge Cases Suite', () => {
  it('should test InMemoryUserRepository findById and clear', async () => {
    const repo = new InMemoryUserRepository();
    const user = new UserEntity('u-1', 'alex@test.com', 'Alex', 'hash');
    await repo.save(user);

    expect(await repo.findById('u-1')).not.toBeNull();
    expect(await repo.findById('u-none')).toBeNull();

    repo.clear();
    expect(await repo.findById('u-1')).toBeNull();
  });

  it('should test InMemoryTaskRepository delete, findById and clear', async () => {
    const repo = new InMemoryTaskRepository();
    const task = new TaskEntity('t-1', 'u-1', 'p-1', 'Task 1', null, TaskStatus.INBOX, Priority.MEDIUM);
    await repo.save(task);

    expect(await repo.findById('t-1', 'u-1')).not.toBeNull();
    expect(await repo.findById('t-1', 'other-user')).toBeNull();
    expect(await repo.findById('nonexistent', 'u-1')).toBeNull();

    expect(await repo.delete('t-1', 'other-user')).toBe(false);
    expect(await repo.delete('t-1', 'u-1')).toBe(true);

    await repo.save(task);
    repo.clear();
    expect(await repo.findById('t-1', 'u-1')).toBeNull();
  });

  it('should test InMemoryProjectRepository findById, findMany, delete and clear', async () => {
    const repo = new InMemoryProjectRepository();
    const p1 = new ProjectEntity('p-1', 'u-1', 'Project 1', null, ProjectStatus.ACTIVE);
    const p2 = new ProjectEntity('p-2', 'u-1', 'Project 2', null, ProjectStatus.PAUSED);
    await repo.save(p1);
    await repo.save(p2);

    expect(await repo.findById('p-1', 'u-1')).not.toBeNull();
    expect(await repo.findById('p-1', 'other')).toBeNull();
    expect(await repo.findById('nonexistent', 'u-1')).toBeNull();

    const activeList = await repo.findMany('u-1', ProjectStatus.ACTIVE);
    expect(activeList).toHaveLength(1);

    expect(await repo.delete('p-1', 'other')).toBe(false);
    expect(await repo.delete('p-1', 'u-1')).toBe(true);

    repo.clear();
    expect(await repo.findById('p-2', 'u-1')).toBeNull();
  });

  it('should test InMemoryEventRepository findById, findUnprocessed, findRecent and clear', async () => {
    const repo = new InMemoryEventRepository();
    const event = new EventEntity('e-1', 'u-1', 'test.event', SourceType.SYSTEM, 'src-1');
    await repo.save(event);

    expect(await repo.findById('e-1', 'u-1')).not.toBeNull();
    expect(await repo.findById('e-1', 'other')).toBeNull();
    expect(await repo.findById('nonexistent', 'u-1')).toBeNull();

    const unproc = await repo.findUnprocessed(10);
    expect(unproc).toHaveLength(1);

    const recent = await repo.findRecentByUser('u-1', 10);
    expect(recent).toHaveLength(1);

    repo.clear();
    expect(await repo.findById('e-1', 'u-1')).toBeNull();
  });

  it('should test InMemoryAuditLogRepository date filtering and clear', async () => {
    const repo = new InMemoryAuditLogRepository();
    const past = new Date(Date.now() - 1000000);
    const future = new Date(Date.now() + 1000000);

    const log1 = new AuditLogEntity('a-1', 'u-1', ActorType.USER, 'ACTION_1', 'Task', 't-1', null, null, null, past);
    const log2 = new AuditLogEntity('a-2', 'u-1', ActorType.AI_AGENT, 'ACTION_2', 'Project', 'p-1', null, null, null, future);

    await repo.save(log1);
    await repo.save(log2);

    const filtered = await repo.query({
      userId: 'u-1',
      startDate: new Date(Date.now() - 500000).toISOString(),
      endDate: new Date(Date.now() + 2000000).toISOString()
    });

    expect(filtered.total).toBe(1);
    expect(filtered.items[0].id).toBe('a-2');

    repo.clear();
    const emptyResult = await repo.query({ userId: 'u-1' });
    expect(emptyResult.total).toBe(0);
  });

  it('should test InMemoryQueueAdapter addJob and clear', async () => {
    const queue = new InMemoryQueueAdapter();
    const jobId = await queue.addJob({ name: 'sync-github', data: { userId: 'u-1' } });
    expect(jobId).toBeDefined();
    expect(queue.getJobs()).toHaveLength(1);

    queue.clear();
    expect(queue.getJobs()).toHaveLength(0);
  });

  it('should test EventEmitterBusAdapter error catch in subscriber and removeAllListeners', async () => {
    const eventBus = new EventEmitterBusAdapter();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    eventBus.subscribe('failing.event', () => {
      throw new Error('Subscriber failure');
    });

    await eventBus.publish({
      eventName: 'failing.event',
      occurredAt: new Date(),
      aggregateId: '1'
    });

    expect(consoleSpy).toHaveBeenCalled();
    eventBus.removeAllListeners();
    consoleSpy.mockRestore();
  });

  it('should test DecisionEntity error cases', () => {
    expect(() => new DecisionEntity('d-1', 'u-1', null, '', 'context', ['A'], 'A', 'reason')).toThrow(DomainError);
    expect(() => new DecisionEntity('d-1', 'u-1', null, 'Title', 'context', ['A'], 'A', 'reason', [], 1.5)).toThrow(DomainError);
    expect(() => new DecisionEntity('d-1', 'u-1', null, 'Title', 'context', ['A'], 'A', 'reason', [], -0.1)).toThrow(DomainError);
  });

  it('should test TaskEntity empty title error', () => {
    expect(() => new TaskEntity('t-1', 'u-1', null, '   ')).toThrow(DomainError);
  });

  it('should test unhandled internal error in error-handler middleware', () => {
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandlerMiddleware(new Error('Unknown crash'), {} as any, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'INTERNAL_SERVER_ERROR' }));
    consoleSpy.mockRestore();
  });

  it('should test createApplication with custom container parameters', () => {
    const customUserRepo = new InMemoryUserRepository();
    const { container } = createApplication({ userRepo: customUserRepo });
    expect(container.userRepo).toBe(customUserRepo);
  });

  it('should test project health calculation when 3 days left and 7 days left', async () => {
    const { container } = createApplication();
    const user = await container.userRepo.save(new UserEntity('u-1', 'u@test.com', 'U', 'h'));

    // 3 days left with low progress
    const deadline3Days = new Date(Date.now() + 86400000 * 2);
    const p3 = await container.projectRepo.save(new ProjectEntity('p-3', user.id, 'P3', null, ProjectStatus.ACTIVE, deadline3Days));
    await container.taskRepo.save(new TaskEntity('t-p3', user.id, p3.id, 'Task P3'));

    const { app } = createApplication(container);
    const tokens = container.tokenService.generateTokens({ userId: user.id, email: user.email });

    const res3 = await request(app)
      .post(`/api/v1/projects/${p3.id}/calculate-health`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res3.status).toBe(200);
    expect(res3.body.data.scheduleRiskScore).toBe(85);

    // 7 days left with low progress
    const deadline7Days = new Date(Date.now() + 86400000 * 6);
    const p7 = await container.projectRepo.save(new ProjectEntity('p-7', user.id, 'P7', null, ProjectStatus.ACTIVE, deadline7Days));
    await container.taskRepo.save(new TaskEntity('t-p7', user.id, p7.id, 'Task P7'));

    const res7 = await request(app)
      .post(`/api/v1/projects/${p7.id}/calculate-health`)
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res7.status).toBe(200);
    expect(res7.body.data.scheduleRiskScore).toBe(60);
  });
});
