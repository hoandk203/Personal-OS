import { ActorType, AuditLog as IAuditLog } from '@personal-os/types';

export class AuditLogEntity implements IAuditLog {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly actor: ActorType,
    readonly action: string,
    readonly resource: string,
    readonly resourceId: string | null = null,
    readonly before: Record<string, unknown> | null = null,
    readonly after: Record<string, unknown> | null = null,
    readonly reason: string | null = null,
    readonly timestamp: Date = new Date()
  ) {}
}
