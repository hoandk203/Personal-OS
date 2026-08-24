import { ConflictError, CryptoService } from '@personal-os/shared';
import { RegisterUserDto, AuthTokensDto, User } from '@personal-os/types';
import { UserEntity } from '../../../domain/entities/user.entity.js';
import { IRegisterUserUseCase } from '../../ports/in/auth.use-cases.port.js';
import { UserRepositoryPort } from '../../ports/out/user-repository.port.js';
import { TokenServicePort } from '../../ports/out/token-service.port.js';
import { randomUUID } from 'node:crypto';

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ user: User; tokens: AuthTokensDto }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`User with email '${dto.email}' already exists`);
    }

    const passwordHash = CryptoService.hashPassword(dto.password);
    const user = new UserEntity(randomUUID(), dto.email, dto.name, passwordHash);
    const saved = await this.userRepo.save(user);

    const tokens = this.tokenService.generateTokens({ userId: saved.id, email: saved.email });
    return { user: saved, tokens };
  }
}
