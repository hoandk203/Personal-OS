import { SourceType, TaskSource as ITaskSource } from '@personal-os/types';

export class TaskSourceVO implements ITaskSource {
  readonly type: SourceType;
  readonly externalReferenceId: string | null;
  readonly externalUrl: string | null;

  constructor(params?: Partial<ITaskSource>) {
    this.type = params?.type ?? SourceType.MANUAL;
    this.externalReferenceId = params?.externalReferenceId ?? null;
    this.externalUrl = params?.externalUrl ?? null;
  }

  isExternal(): boolean {
    return this.type !== SourceType.MANUAL && this.type !== SourceType.SYSTEM;
  }
}
