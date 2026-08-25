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

    const tasks = await this.taskRepo.findMany({ userId, projectId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
    const overdueTasks = tasks.filter(t => t.isOverdue()).length;

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

    // Blocker risk increases if there are blocked tasks or overdue tasks
    let blockerRiskScore = 15;
    if (blockedTasks > 0) {
      blockerRiskScore += Math.min(50, blockedTasks * 25);
    }
    if (overdueTasks > 0) {
      blockerRiskScore += Math.min(35, overdueTasks * 15);
    }
    blockerRiskScore = Math.min(100, blockerRiskScore);

    // Momentum score
    const momentumScore = progressScore > 0 ? Math.min(100, Math.round(progressScore * 1.1 + (inProgressTasks * 5))) : 10;

    const healthVo = new ProjectHealthVO({
      progressScore,
      momentumScore,
      scheduleRiskScore,
      blockerRiskScore,
      breakdown: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        bottleneckPrs: 0
      }
    });

    project.updateHealth(healthVo);
    await this.projectRepo.save(project);

    return healthVo;
  }
}
