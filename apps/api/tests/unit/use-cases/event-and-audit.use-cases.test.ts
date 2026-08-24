import { describe, it, expect, beforeEach } from 'vitest';
import { IngestEventUseCase } from '../../../src/core/application/use-cases/events/ingest-event.use-case.js';
import { RecordAuditLogUseCase, QueryAuditLogsUseCase } from '../../../src/core/application/use-cases/audit/record-audit-log.use-case.js';
import { InMemoryEventRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-event.repository.js';
import { InMemoryAuditLogRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-audit-log.repository.js';
import { SourceType, ActorType } from '@personal-os/types';

describe('Event & AuditLog Use Cases Suite', () => {
  let eventRepo: InMemoryEventRepository;
  let auditRepo: InMemoryAuditLogRepository;
  let ingestEventUseCase: IngestEventUseCase;
  let recordAuditLogUseCase: RecordAuditLogUseCase;
  let queryAuditLogsUseCase: QueryAuditLogsUseCase;

  beforeEach(() => {
    eventRepo = new InMemoryEventRepository();
    auditRepo = new InMemoryAuditLogRepository();
    ingestEventUseCase = new IngestEventUseCase(eventRepo);
    recordAuditLogUseCase = new RecordAuditLogUseCase(auditRepo);
    queryAuditLogsUseCase = new QueryAuditLogsUseCase(auditRepo);
  });

  it('should ingest and store normalized event', async () => {
    const event = await ingestEventUseCase.execute('user-1', {
      type: 'github.commit.pushed',
      source: SourceType.GITHUB,
      sourceId: 'commit-abc1234',
      payload: { branch: 'main', message: 'feat: add clean arch' }
    });

    expect(event.id).toBeDefined();
    expect(event.type).toBe('github.commit.pushed');
    expect(event.source).toBe(SourceType.GITHUB);

    const unproc = await eventRepo.findUnprocessed();
    expect(unproc).toHaveLength(1);
  });

  it('should record and query audit logs with filters', async () => {
    await recordAuditLogUseCase.execute({
      userId: 'user-1',
      actor: ActorType.USER,
      action: 'UPDATE_TASK',
      resource: 'Task',
      resourceId: 't-10',
      before: { status: 'INBOX' },
      after: { status: 'COMPLETED' },
      reason: 'Work finished'
    });

    await recordAuditLogUseCase.execute({
      userId: 'user-1',
      actor: ActorType.AI_AGENT,
      action: 'AUTO_RESCHEDULE',
      resource: 'Calendar',
      resourceId: 'c-20'
    });

    const allLogs = await queryAuditLogsUseCase.execute({ userId: 'user-1' });
    expect(allLogs.total).toBe(2);
    expect(allLogs.items).toHaveLength(2);

    const userLogs = await queryAuditLogsUseCase.execute({ userId: 'user-1', actor: ActorType.USER });
    expect(userLogs.total).toBe(1);
    expect(userLogs.items[0].action).toBe('UPDATE_TASK');

    const taskLogs = await queryAuditLogsUseCase.execute({ userId: 'user-1', resource: 'Task' });
    expect(taskLogs.total).toBe(1);
  });
});
