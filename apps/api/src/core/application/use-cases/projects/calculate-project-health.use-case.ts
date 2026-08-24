import { NotFoundError } from '@personal-os/shared';
import { ProjectHealth } from '@personal-os/types';
import { ProjectHealthVO } from '../../../domain/value-objects/project-health.vo.js';
import { ICalculateProjectHealthUseCase } from '../../ports/in/project.use-cases.port.js';
import { ProjectRepositoryPort } from '../../ports/out/project-repository.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';

export class CalculateProjectHealthUseCase implements ICalculateProjectHealthUseCase {
  constructor(
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly taskRepo: TaskRepositoryPort
  ) {}

  async execute(projectId: string, userId: string): Promise<ProjectHealth> {
    const project = await this.projectRepo.findById(projectId, userId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    const totalTasks = await this.taskRepo.countTotalByProject(projectId, userId);
    const completedTasks = await this.taskRepo.countCompletedByProject(projectId, userId);

    let progressScore = 0;
    if (totalTasks > 0) {
      progressScore = (completedTasks / totalTasks) * 100;
    }

    // Determine schedule risk based on deadline
    let scheduleRiskScore = 0;
    if (project.deadline) {
      const now = Date.now();
      const deadlineTime = project.deadline.getTime();
      const timeLeftDays = (deadlineTime - now) / (1000 * 60 * 60 * 24);

      if (timeLeftDays < 0) {
        scheduleRiskScore = 100; // Overdue
      } else if (timeLeftDays <= 3 && progressScore < 80) {
        scheduleRiskScore = 85;
      } else if (timeLeftDays <= 7 && progressScore < 50) {
        scheduleRiskScore = 60;
      } else {
        scheduleRiskScore = Math.max(0, 100 - progressScore);
      }
    }

    // Momentum score
    const momentumScore = progressScore > 0 ? Math.min(100, progressScore * 1.2) : 10;
    const blockerRiskScore = totalTasks > 0 && completedTasks === 0 && scheduleRiskScore > 50 ? 60 : 20;

    const healthVo = new ProjectHealthVO({
      progressScore,
      momentumScore,
      scheduleRiskScore,
      blockerRiskScore
    });

    project.updateHealth(healthVo);
    await this.projectRepo.save(project);

    return healthVo;
  }
}
