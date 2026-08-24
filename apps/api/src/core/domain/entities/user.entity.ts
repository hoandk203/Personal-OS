import { DomainError } from '@personal-os/shared';
import { User as IUser } from '@personal-os/types';

export class UserEntity implements IUser {
  constructor(
    readonly id: string,
    public email: string,
    public name: string,
    public passwordHash: string,
    readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new DomainError('Invalid email format', 'INVALID_EMAIL');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainError('User name cannot be empty', 'INVALID_USER_NAME');
    }
  }

  updateProfile(name: string): void {
    this.name = name;
    this.validate();
    this.updatedAt = new Date();
  }
}
