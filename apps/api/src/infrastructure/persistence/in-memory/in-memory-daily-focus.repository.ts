import { DailyFocus } from '@personal-os/types';
import { DailyFocusRepositoryPort } from '../../../core/application/ports/out/daily-focus-repository.port.js';

export class InMemoryDailyFocusRepository implements DailyFocusRepositoryPort {
  private readonly items = new Map<string, DailyFocus>();

  private makeKey(userId: string, date: string): string {
    return `${userId}:${date}`;
  }

  async findByUserAndDate(userId: string, date: string): Promise<DailyFocus | null> {
    const key = this.makeKey(userId, date);
    return this.items.get(key) ?? null;
  }

  async save(dailyFocus: DailyFocus): Promise<DailyFocus> {
    const key = this.makeKey(dailyFocus.userId, dailyFocus.date);
    this.items.set(key, dailyFocus);
    return dailyFocus;
  }

  async findRecent(userId: string, limit = 7): Promise<DailyFocus[]> {
    return Array.from(this.items.values())
      .filter(f => f.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  clear(): void {
    this.items.clear();
  }
}
