import { ProjectStatus } from '@personal-os/types';
import { ProjectEntity } from '../../../core/domain/entities/project.entity.js';
import { ProjectRepositoryPort } from '../../../core/application/ports/out/project-repository.port.js';

export class InMemoryProjectRepository implements ProjectRepositoryPort {
  private readonly projects = new Map<string, ProjectEntity>();

  async save(project: ProjectEntity): Promise<ProjectEntity> {
    this.projects.set(project.id, project);
    return project;
  }

  async findById(id: string, userId: string): Promise<ProjectEntity | null> {
    const project = this.projects.get(id);
    if (project && project.userId === userId) {
      return project;
    }
    return null;
  }

  async findMany(userId: string, status?: ProjectStatus): Promise<ProjectEntity[]> {
    let list = Array.from(this.projects.values()).filter(p => p.userId === userId);
    if (status) {
      list = list.filter(p => p.status === status);
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const project = this.projects.get(id);
    if (project && project.userId === userId) {
      this.projects.delete(id);
      return true;
    }
    return false;
  }

  clear(): void {
    this.projects.clear();
  }
}
