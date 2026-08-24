import { DomainError } from '@personal-os/shared';

export class CognitiveLoad {
  private readonly value: number;

  constructor(level: number) {
    if (!Number.isInteger(level) || level < 1 || level > 5) {
      throw new DomainError('Cognitive load must be an integer between 1 and 5', 'INVALID_COGNITIVE_LOAD');
    }
    this.value = level;
  }

  getValue(): number {
    return this.value;
  }

  isHigh(): boolean {
    return this.value >= 4;
  }

  equals(other: CognitiveLoad): boolean {
    return this.value === other.value;
  }
}
