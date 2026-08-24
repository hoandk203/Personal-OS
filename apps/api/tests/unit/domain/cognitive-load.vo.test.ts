import { describe, it, expect } from 'vitest';
import { CognitiveLoad } from '../../../src/core/domain/value-objects/cognitive-load.vo.js';
import { DomainError } from '@personal-os/shared';

describe('CognitiveLoad Value Object', () => {
  it('should create valid cognitive load levels (1 to 5)', () => {
    for (let level = 1; level <= 5; level++) {
      const vo = new CognitiveLoad(level);
      expect(vo.getValue()).toBe(level);
    }
  });

  it('should throw DomainError for invalid levels (< 1 or > 5 or non-integer)', () => {
    expect(() => new CognitiveLoad(0)).toThrow(DomainError);
    expect(() => new CognitiveLoad(6)).toThrow(DomainError);
    expect(() => new CognitiveLoad(-1)).toThrow(DomainError);
    expect(() => new CognitiveLoad(2.5)).toThrow(DomainError);
  });

  it('should correctly identify high cognitive load (level >= 4)', () => {
    expect(new CognitiveLoad(1).isHigh()).toBe(false);
    expect(new CognitiveLoad(3).isHigh()).toBe(false);
    expect(new CognitiveLoad(4).isHigh()).toBe(true);
    expect(new CognitiveLoad(5).isHigh()).toBe(true);
  });

  it('should compare equality correctly', () => {
    const vo1 = new CognitiveLoad(3);
    const vo2 = new CognitiveLoad(3);
    const vo3 = new CognitiveLoad(4);

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
