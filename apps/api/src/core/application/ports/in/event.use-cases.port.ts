import { IngestEventDto, NormalizedEvent } from '@personal-os/types';

export interface IIngestEventUseCase {
  execute(userId: string, dto: IngestEventDto): Promise<NormalizedEvent>;
}
