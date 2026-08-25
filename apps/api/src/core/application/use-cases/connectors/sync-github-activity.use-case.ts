import { ConnectorSyncResultDto, SourceType } from '@personal-os/types';
import { ISyncGitHubActivityUseCase } from '../../ports/in/connector.use-cases.port.js';
import { GitHubConnectorPort } from '../../ports/out/github-connector.port.js';
import { EventRepositoryPort } from '../../ports/out/event-repository.port.js';
import { EventEntity } from '../../../domain/entities/event.entity.js';
import { randomUUID } from 'node:crypto';

export class SyncGitHubActivityUseCase implements ISyncGitHubActivityUseCase {
  constructor(
    private readonly githubConnector: GitHubConnectorPort,
    private readonly eventRepo?: EventRepositoryPort
  ) {}

  async execute(userId: string, options?: { mockFallback?: boolean; token?: string }): Promise<ConnectorSyncResultDto> {
    const data = await this.githubConnector.syncActivity(userId, options?.token, options);

    const warnings: string[] = [];
    let itemsCount = data.commits.length + data.pullRequests.length + data.issues.length;

    // Ingest events
    if (this.eventRepo) {
      for (const pr of data.pullRequests) {
        const event = new EventEntity(
          randomUUID(),
          userId,
          `github.pull_request.${pr.state.toLowerCase()}`,
          SourceType.GITHUB,
          pr.id,
          {
            number: pr.number,
            title: pr.title,
            repo: pr.repo,
            url: pr.url,
            isBottleneck: pr.isBottleneck,
            hoursOpen: pr.hoursOpen
          },
          pr.createdAt
        );
        await this.eventRepo.save(event);

        if (pr.isBottleneck) {
          warnings.push(`PR #${pr.number} "${pr.title}" in ${pr.repo} has been open for ${pr.hoursOpen}h without review.`);
        }
      }

      for (const commit of data.commits) {
        const event = new EventEntity(
          randomUUID(),
          userId,
          'github.commit.created',
          SourceType.GITHUB,
          commit.sha,
          {
            sha: commit.sha,
            message: commit.message,
            author: commit.author,
            repo: commit.repo,
            url: commit.url
          },
          commit.date
        );
        await this.eventRepo.save(event);
      }
    }

    return {
      source: SourceType.GITHUB,
      success: true,
      itemsSynced: itemsCount,
      warnings,
      syncedAt: data.syncedAt.toISOString(),
      summary: {
        commitsCount: data.commits.length,
        openPrsCount: data.pullRequests.filter(p => p.state === 'OPEN').length,
        bottleneckPrsCount: data.bottleneckPrs.length,
        issuesCount: data.issues.length,
        commits: data.commits,
        pullRequests: data.pullRequests,
        issues: data.issues
      }
    };
  }
}
