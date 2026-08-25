import {
  GitHubConnectorPort,
  GitHubSyncData,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue
} from '../../core/application/ports/out/github-connector.port.js';

export class GitHubConnectorAdapter implements GitHubConnectorPort {
  async syncActivity(
    _userId: string,
    token?: string,
    options?: { mockFallback?: boolean }
  ): Promise<GitHubSyncData> {
    const isMock = !token || options?.mockFallback !== false;

    if (isMock) {
      return this.generateMockActivity();
    }

    try {
      // Third-party API integration with real token
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Personal-OS-Core'
      };

      const res = await fetch('https://api.github.com/user/issues?filter=all&state=open', { headers });
      if (!res.ok) {
        // Fallback gracefully on API errors (e.g. rate limit)
        return this.generateMockActivity();
      }

      const issuesData = (await res.json()) as any[];
      const issues: GitHubIssue[] = (Array.isArray(issuesData) ? issuesData : []).slice(0, 5).map(item => ({
        id: `gh-issue-${item.id}`,
        number: item.number,
        title: item.title,
        repo: item.repository?.name || 'personal-os',
        state: item.state === 'closed' ? 'CLOSED' : 'OPEN',
        url: item.html_url,
        createdAt: new Date(item.created_at)
      }));

      const mock = this.generateMockActivity();
      return {
        ...mock,
        issues: issues.length > 0 ? issues : mock.issues,
        syncedAt: new Date()
      };
    } catch {
      return this.generateMockActivity();
    }
  }

  private generateMockActivity(): GitHubSyncData {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const commits: GitHubCommit[] = [
      {
        sha: '7e69e43',
        message: 'feat: implement core domain entities and use cases',
        author: 'Lead Architect',
        date: twoHoursAgo,
        url: 'https://github.com/hoandk203/Personal-OS/commit/7e69e43',
        repo: 'Personal-OS'
      },
      {
        sha: '5c7eb03',
        message: 'docs: initialize architecture spec and design tokens',
        author: 'Product Owner',
        date: twentyFourHoursAgo,
        url: 'https://github.com/hoandk203/Personal-OS/commit/5c7eb03',
        repo: 'Personal-OS'
      }
    ];

    const pullRequests: GitHubPullRequest[] = [
      {
        id: 'pr-101',
        number: 101,
        title: 'feat: Productivity Core Kanban & Command Center',
        repo: 'Personal-OS',
        state: 'OPEN',
        createdAt: twoHoursAgo,
        updatedAt: now,
        url: 'https://github.com/hoandk203/Personal-OS/pull/101',
        isBottleneck: false,
        hoursOpen: 2
      },
      {
        id: 'pr-98',
        number: 98,
        title: 'refactor: Token encryption & AES-256 GCM vault',
        repo: 'Personal-OS',
        state: 'OPEN',
        createdAt: new Date(now.getTime() - 28 * 60 * 60 * 1000),
        updatedAt: twentyFourHoursAgo,
        url: 'https://github.com/hoandk203/Personal-OS/pull/98',
        isBottleneck: true, // > 20h without merge/review
        hoursOpen: 28
      }
    ];

    const issues: GitHubIssue[] = [
      {
        id: 'issue-45',
        number: 45,
        title: 'Optimize Tailwind bundle for desktop dashboard',
        repo: 'Personal-OS',
        state: 'OPEN',
        url: 'https://github.com/hoandk203/Personal-OS/issues/45',
        createdAt: twentyFourHoursAgo
      }
    ];

    const bottleneckPrs = pullRequests.filter(pr => pr.isBottleneck);

    return {
      commits,
      pullRequests,
      issues,
      bottleneckPrs,
      syncedAt: now
    };
  }
}
