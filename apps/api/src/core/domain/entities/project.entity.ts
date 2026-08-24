import { DomainError } from '@personal-os/shared';
import { ProjectStatus, Project as IProject } from '@personal-os/types';
import { ProjectHealthVO } from '../value-objects/project-health.vo.js';

export class ProjectEntity implements IProject {
  public health: ProjectHealthVO | null;

  constructor(
    readonly id: string,
    readonly userId: string,
    public name: string,
    public description: string | null = null,
    public status: ProjectStatus = ProjectStatus.ACTIVE,
    public deadline: Date | null = null,
    public tags: string[] = [],
    health?: ProjectHealthVO | null,
    readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Project name cannot be empty', 'INVALID_PROJECT_NAME');
    }
    this.health = health ?? null;
  }

  updateHealth(health: ProjectHealthVO): void {
    this.health = health;
    this.updatedAt = new Date();
  }

  changeStatus(newStatus: ProjectStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
