import { describe, it, expect } from 'vitest';
import { ProjectHealthVO } from '../../../src/core/domain/value-objects/project-health.vo.js';
import { DomainError } from '@personal-os/shared';
import { ProjectHealthStatus } from '@personal-os/types';

describe('ProjectHealthVO Value Object', () => {
  it('should create valid project health VO with rounded scores', () => {
    const health = new ProjectHealthVO({
      progressScore: 72.456,
      momentumScore: 81.234,
      scheduleRiskScore: 25.0,
      blockerRiskScore: 10.5
    });

    expect(health.progressScore).toBe(72.5);
    expect(health.momentumScore).toBe(81.2);
    expect(health.scheduleRiskScore).toBe(25.0);
    expect(health.blockerRiskScore).toBe(10.5);
    expect(health.lastCalculatedAt).toBeInstanceOf(Date);
  });

  it('should throw DomainError if scores are out of bounds (0-100)', () => {
    expect(() => new ProjectHealthVO({ progressScore: -5, momentumScore: 50, scheduleRiskScore: 10, blockerRiskScore: 10 })).toThrow(DomainError);
    expect(() => new ProjectHealthVO({ progressScore: 105, momentumScore: 50, scheduleRiskScore: 10, blockerRiskScore: 10 })).toThrow(DomainError);
    expect(() => new ProjectHealthVO({ progressScore: 50, momentumScore: NaN, scheduleRiskScore: 10, blockerRiskScore: 10 })).toThrow(DomainError);
  });

  it('should evaluate overall health status properly', () => {
    const excellent = new ProjectHealthVO({ progressScore: 90, momentumScore: 80, scheduleRiskScore: 20, blockerRiskScore: 10 });
    expect(excellent.getOverallHealthStatus()).toBe(ProjectHealthStatus.EXCELLENT);
    expect(excellent.overallScore).toBeGreaterThanOrEqual(80);

    const healthy = new ProjectHealthVO({ progressScore: 65, momentumScore: 65, scheduleRiskScore: 30, blockerRiskScore: 20 });
    expect(healthy.getOverallHealthStatus()).toBe(ProjectHealthStatus.HEALTHY);

    const needsAttention = new ProjectHealthVO({ progressScore: 50, momentumScore: 20, scheduleRiskScore: 45, blockerRiskScore: 10 });
    expect(needsAttention.getOverallHealthStatus()).toBe(ProjectHealthStatus.NEEDS_ATTENTION);

    const atRisk = new ProjectHealthVO({ progressScore: 30, momentumScore: 40, scheduleRiskScore: 75, blockerRiskScore: 80 });
    expect(atRisk.getOverallHealthStatus()).toBe(ProjectHealthStatus.AT_RISK);
  });
});
