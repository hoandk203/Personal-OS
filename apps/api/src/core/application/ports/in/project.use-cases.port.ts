import { CreateProjectDto, UpdateProjectDto, Project, ProjectHealth } from '@personal-os/types';

export interface ICreateProjectUseCase {
  execute(userId: string, dto: CreateProjectDto): Promise<Project>;
}

export interface IUpdateProjectUseCase {
  execute(id: string, userId: string, dto: UpdateProjectDto): Promise<Project>;
}

export interface ICalculateProjectHealthUseCase {
  execute(projectId: string, userId: string): Promise<ProjectHealth>;
}
