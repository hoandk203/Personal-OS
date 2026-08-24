import { CreateAuditLogDto, QueryAuditLogsDto, AuditLog } from '@personal-os/types';
import { AuditLogEntity } from '../../../domain/entities/audit-log.entity.js';
import { IRecordAuditLogUseCase, IQueryAuditLogsUseCase } from '../../ports/in/audit-log.use-cases.port.js';
import { AuditLogRepositoryPort } from '../../ports/out/audit-log-repository.port.js';
import { randomUUID } from 'node:crypto';

export class RecordAuditLogUseCase implements IRecordAuditLogUseCase {
  constructor(private readonly auditRepo: AuditLogRepositoryPort) {}

  async execute(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = new AuditLogEntity(
      randomUUID(),
      dto.userId,
      dto.actor,
      dto.action,
      dto.resource,
      dto.resourceId ?? null,
      dto.before ?? null,
      dto.after ?? null,
      dto.reason ?? null,
      new Date()
    );

    return this.auditRepo.save(log);
  }
}

export class QueryAuditLogsUseCase implements IQueryAuditLogsUseCase {
  constructor(private readonly auditRepo: AuditLogRepositoryPort) {}

  async execute(filter: QueryAuditLogsDto): Promise<{ items: AuditLog[]; total: number }> {
    return this.auditRepo.query(filter);
  }
}
