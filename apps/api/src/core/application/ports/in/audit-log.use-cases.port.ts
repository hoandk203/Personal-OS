import { CreateAuditLogDto, QueryAuditLogsDto, AuditLog } from '@personal-os/types';

export interface IRecordAuditLogUseCase {
  execute(dto: CreateAuditLogDto): Promise<AuditLog>;
}

export interface IQueryAuditLogsUseCase {
  execute(filter: QueryAuditLogsDto): Promise<{ items: AuditLog[]; total: number }>;
}
