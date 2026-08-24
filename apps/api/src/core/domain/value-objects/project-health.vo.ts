import { DomainError } from '@personal-os/shared';
import { ProjectHealth as IProjectHealth } from '@personal-os/types';

export class ProjectHealthVO implements IProjectHealth {
  readonly progressScore: number;
  readonly momentumScore: number;
  readonly scheduleRiskScore: number;
  readonly blockerRiskScore: number;
  readonly lastCalculatedAt: Date;

  constructor(params: {
    progressScore: number;
    momentumScore: number;
    scheduleRiskScore: number;
    blockerRiskScore: number;
    lastCalculatedAt?: Date;
  }) {
    this.validateScore(params.progressScore, 'progressScore');
    this.validateScore(params.momentumScore, 'momentumScore');
    this.validateScore(params.scheduleRiskScore, 'scheduleRiskScore');
    this.validateScore(params.blockerRiskScore, 'blockerRiskScore');

    this.progressScore = Math.round(params.progressScore * 10) / 10;
    this.momentumScore = Math.round(params.momentumScore * 10) / 10;
    this.scheduleRiskScore = Math.round(params.scheduleRiskScore * 10) / 10;
    this.blockerRiskScore = Math.round(params.blockerRiskScore * 10) / 10;
    this.lastCalculatedAt = params.lastCalculatedAt ?? new Date();
  }

  private validateScore(score: number, fieldName: string): void {
    if (isNaN(score) || score < 0 || score > 100) {
      throw new DomainError(`${fieldName} must be a number between 0 and 100`, 'INVALID_PROJECT_HEALTH_SCORE');
    }
  }

  getOverallHealthStatus(): 'HEALTHY' | 'NEEDS_ATTENTION' | 'AT_RISK' {
    if (this.scheduleRiskScore > 70 || this.blockerRiskScore > 70) {
      return 'AT_RISK';
    }
    if (this.scheduleRiskScore > 40 || this.blockerRiskScore > 40 || this.momentumScore < 30) {
      return 'NEEDS_ATTENTION';
    }
    return 'HEALTHY';
  }
}
