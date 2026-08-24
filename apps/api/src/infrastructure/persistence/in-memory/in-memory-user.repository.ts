import { UserEntity } from '../../../core/domain/entities/user.entity.js';
import { UserRepositoryPort } from '../../../core/application/ports/out/user-repository.port.js';

export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly users = new Map<string, UserEntity>();

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  clear(): void {
    this.users.clear();
  }
}
