import { UnauthorizedError, CryptoService } from '@personal-os/shared';
import { AuthenticateUserDto, AuthTokensDto, User } from '@personal-os/types';
import { IAuthenticateUserUseCase } from '../../ports/in/auth.use-cases.port.js';
import { UserRepositoryPort } from '../../ports/out/user-repository.port.js';
import { TokenServicePort } from '../../ports/out/token-service.port.js';

export class AuthenticateUserUseCase implements IAuthenticateUserUseCase {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(dto: AuthenticateUserDto): Promise<{ user: User; tokens: AuthTokensDto }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = CryptoService.verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.tokenService.generateTokens({ userId: user.id, email: user.email });
    return { user, tokens };
  }
}
