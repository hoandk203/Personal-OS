import { DomainError } from '@personal-os/shared';
import { ProjectHealth as IProjectHealth, ProjectHealthStatus } from '@personal-os/types';

export class ProjectHealthVO implements IProjectHealth {
  readonly progressScore: number;
  readonly momentumScore: number;
  readonly scheduleRiskScore: number;
  readonly blockerRiskScore: number;
  readonly overallScore: number;
  readonly status: ProjectHealthStatus;
  readonly lastCalculatedAt: Date;
  readonly breakdown?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    bottleneckPrs: number;
  };

  constructor(params: {
    progressScore: number;
    momentumScore: number;
    scheduleRiskScore: number;
    blockerRiskScore: number;
    overallScore?: number;
    status?: ProjectHealthStatus;
    lastCalculatedAt?: Date;
    breakdown?: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      blockedTasks: number;
      overdueTasks: number;
      bottleneckPrs: number;
    };
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
    this.breakdown = params.breakdown;

    if (params.overallScore !== undefined) {
      this.validateScore(params.overallScore, 'overallScore');
      this.overallScore = Math.round(params.overallScore * 10) / 10;
    } else {
      const positiveFactor = (this.progressScore * 0.35) + (this.momentumScore * 0.35);
      const riskFactor = ((100 - this.scheduleRiskScore) * 0.15) + ((100 - this.blockerRiskScore) * 0.15);
      this.overallScore = Math.max(0, Math.min(100, Math.round((positiveFactor + riskFactor) * 10) / 10));
    }

    if (params.status) {
      this.status = params.status;
    } else {
      if (this.scheduleRiskScore > 70 || this.blockerRiskScore > 70 || this.overallScore < 40) {
        this.status = ProjectHealthStatus.AT_RISK;
      } else if (this.scheduleRiskScore > 40 || this.blockerRiskScore > 40 || this.momentumScore < 30 || this.overallScore < 60) {
        this.status = ProjectHealthStatus.NEEDS_ATTENTION;
      } else if (this.overallScore >= 80) {
        this.status = ProjectHealthStatus.EXCELLENT;
      } else {
        this.status = ProjectHealthStatus.HEALTHY;
      }
    }
  }

  private validateScore(score: number, fieldName: string): void {
    if (isNaN(score) || score < 0 || score > 100) {
      throw new DomainError(`${fieldName} must be a number between 0 and 100`, 'INVALID_PROJECT_HEALTH_SCORE');
    }
  }

  getOverallHealthStatus(): ProjectHealthStatus {
    return this.status;
  }
}
