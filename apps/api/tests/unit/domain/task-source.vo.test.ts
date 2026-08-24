import { describe, it, expect } from 'vitest';
import { TaskSourceVO } from '../../../src/core/domain/value-objects/task-source.vo.js';
import { SourceType } from '@personal-os/types';

describe('TaskSourceVO Value Object', () => {
  it('should default to MANUAL source', () => {
    const vo = new TaskSourceVO();
    expect(vo.type).toBe(SourceType.MANUAL);
    expect(vo.externalReferenceId).toBeNull();
    expect(vo.externalUrl).toBeNull();
    expect(vo.isExternal()).toBe(false);
  });

  it('should recognize external sources (GitHub, Google Calendar, etc.)', () => {
    const ghVo = new TaskSourceVO({
      type: SourceType.GITHUB,
      externalReferenceId: 'PR-123',
      externalUrl: 'https://github.com/org/repo/pull/123'
    });
    expect(ghVo.type).toBe(SourceType.GITHUB);
    expect(ghVo.isExternal()).toBe(true);
  });
});
