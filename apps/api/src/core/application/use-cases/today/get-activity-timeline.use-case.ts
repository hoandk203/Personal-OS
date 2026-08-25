import { ActivityTimelineResponseDto, ActivityTimelineItem, SourceType } from '@personal-os/types';
import { IGetActivityTimelineUseCase } from '../../ports/in/today.use-cases.port.js';
import { EventRepositoryPort } from '../../ports/out/event-repository.port.js';
import { TaskRepositoryPort } from '../../ports/out/task-repository.port.js';

export class GetActivityTimelineUseCase implements IGetActivityTimelineUseCase {
  constructor(
    private readonly eventRepo: EventRepositoryPort,
    private readonly taskRepo?: TaskRepositoryPort
  ) {}

  async execute(userId: string, limit = 20): Promise<ActivityTimelineResponseDto> {
    const events = await this.eventRepo.findRecentByUser(userId, limit);

    const items: ActivityTimelineItem[] = events.map((e: any) => {
      let title = e.type;
      let description = JSON.stringify(e.payload);

      if (e.type.startsWith('github.commit')) {
        title = `Git Commit in ${(e.payload.repo as string) || 'repo'}`;
        description = (e.payload.message as string) || 'Commit pushed';
      } else if (e.type.startsWith('github.pull_request')) {
        const action = e.type.split('.').pop() || 'updated';
        title = `GitHub PR #${e.payload.number || ''} ${action.toUpperCase()}`;
        description = (e.payload.title as string) || 'Pull request activity';
      } else if (e.type.startsWith('calendar')) {
        title = `Calendar Event: ${(e.payload.title as string) || 'Meeting'}`;
        description = `Scheduled for ${(e.payload.durationMinutes as number) || 30} mins`;
      } else if (e.type.startsWith('task')) {
        title = `Task Event`;
        description = (e.payload.title as string) || 'Task status changed';
      }

      return {
        id: e.id,
        type: e.type,
        title,
        description,
        source: e.source as SourceType,
        timestamp: e.occurredAt,
        metadata: e.payload
      };
    });

    // If there are few events, augment with recent tasks
    if (items.length < 5 && this.taskRepo) {
      const recentTasks = await this.taskRepo.findMany({ userId });
      for (const t of recentTasks.slice(0, 5 - items.length)) {
        items.push({
          id: `task-item-${t.id}`,
          type: 'task.created',
          title: `Task: ${t.title}`,
          description: `Priority: ${t.priority}, Status: ${t.status}`,
          source: (t.source?.type as SourceType) || SourceType.MANUAL,
          timestamp: t.createdAt
        });
      }
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      items: items.slice(0, limit),
      total: items.length
    };
  }
}
