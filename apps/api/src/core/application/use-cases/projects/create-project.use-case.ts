import { CreateProjectDto, UpdateProjectDto, Project, ProjectStatus } from '@personal-os/types';
import { ProjectEntity } from '../../../domain/entities/project.entity.js';
import { ProjectCreatedEvent } from '../../../domain/events/domain-events.js';
import { ICreateProjectUseCase, IUpdateProjectUseCase } from '../../ports/in/project.use-cases.port.js';
import { ProjectRepositoryPort } from '../../ports/out/project-repository.port.js';
import { EventBusPort } from '../../ports/out/event-bus.port.js';
import { NotFoundError } from '@personal-os/shared';
import { randomUUID } from 'node:crypto';

export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly eventBus?: EventBusPort
  ) {}

  async execute(userId: string, dto: CreateProjectDto): Promise<Project> {
    const project = new ProjectEntity(
      randomUUID(),
      userId,
      dto.name,
      dto.description ?? null,
      ProjectStatus.ACTIVE,
      dto.deadline ? new Date(dto.deadline) : null,
      dto.tags ?? []
    );

    const saved = await this.projectRepo.save(project);

    if (this.eventBus) {
      await this.eventBus.publish(new ProjectCreatedEvent(saved.id, saved.userId, saved.name));
    }

    return saved;
  }
}

export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(id: string, userId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepo.findById(id, userId);
    if (!project) {
      throw new NotFoundError('Project', id);
    }

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;
    if (dto.status !== undefined) project.changeStatus(dto.status);
    if (dto.deadline !== undefined) project.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.tags !== undefined) project.tags = dto.tags;

    return this.projectRepo.save(project);
  }
}
