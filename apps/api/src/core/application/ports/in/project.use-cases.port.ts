import { CreateProjectDto, UpdateProjectDto, Project, ProjectHealth, ProjectStatus } from '@personal-os/types';

export interface ICreateProjectUseCase {
  execute(userId: string, dto: CreateProjectDto): Promise<Project>;
}

export interface IUpdateProjectUseCase {
  execute(id: string, userId: string, dto: UpdateProjectDto): Promise<Project>;
}

export interface IListProjectsUseCase {
  execute(userId: string, status?: ProjectStatus): Promise<Project[]>;
}

export interface IGetProjectByIdUseCase {
  execute(id: string, userId: string): Promise<Project>;
}

export interface IDeleteProjectUseCase {
  execute(id: string, userId: string): Promise<boolean>;
}

export interface ICalculateProjectHealthUseCase {
  execute(projectId: string, userId: string): Promise<ProjectHealth>;
}
