import { QueryAuditLogsDto } from '@personal-os/types';
import { AuditLogEntity } from '../../../core/domain/entities/audit-log.entity.js';
import { AuditLogRepositoryPort } from '../../../core/application/ports/out/audit-log-repository.port.js';

export class InMemoryAuditLogRepository implements AuditLogRepositoryPort {
  private readonly logs: AuditLogEntity[] = [];

  async save(log: AuditLogEntity): Promise<AuditLogEntity> {
    this.logs.push(log);
    return log;
  }

  async query(filter: QueryAuditLogsDto): Promise<{ items: AuditLogEntity[]; total: number }> {
    let result = this.logs.filter(l => l.userId === filter.userId);

    if (filter.resource) {
      result = result.filter(l => l.resource.toLowerCase() === filter.resource!.toLowerCase());
    }

    if (filter.actor) {
      result = result.filter(l => l.actor === filter.actor);
    }

    if (filter.startDate) {
      const start = new Date(filter.startDate);
      result = result.filter(l => l.timestamp >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate);
      result = result.filter(l => l.timestamp <= end);
    }

    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = result.length;
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? 50;
    const items = result.slice(offset, offset + limit);

    return { items, total };
  }

  clear(): void {
    this.logs.length = 0;
  }
}
