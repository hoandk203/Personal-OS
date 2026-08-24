export interface JobPayload<T = unknown> {
  name: string;
  data: T;
  opts?: {
    attempts?: number;
    backoff?: { type: 'exponential' | 'fixed'; delay: number };
    delay?: number;
  };
}

export interface QueuePort {
  addJob<T>(job: JobPayload<T>): Promise<string>;
}

export class InMemoryQueueAdapter implements QueuePort {
  private readonly jobs: Array<JobPayload & { id: string; status: 'PENDING' | 'COMPLETED' }> = [];

  async addJob<T>(job: JobPayload<T>): Promise<string> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.jobs.push({ ...job, id, status: 'PENDING' });
    return id;
  }

  getJobs() {
    return this.jobs;
  }

  clear() {
    this.jobs.length = 0;
  }
}
