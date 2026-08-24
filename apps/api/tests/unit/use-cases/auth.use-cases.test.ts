import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../src/core/application/use-cases/auth/register-user.use-case.js';
import { AuthenticateUserUseCase } from '../../../src/core/application/use-cases/auth/authenticate-user.use-case.js';
import { InMemoryUserRepository } from '../../../src/infrastructure/persistence/in-memory/in-memory-user.repository.js';
import { JwtTokenService } from '../../../src/infrastructure/security/jwt-token.service.js';
import { ConflictError, UnauthorizedError } from '@personal-os/shared';

describe('Auth Use Cases Suite', () => {
  let userRepo: InMemoryUserRepository;
  let tokenService: JwtTokenService;
  let registerUseCase: RegisterUserUseCase;
  let authUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    tokenService = new JwtTokenService();
    registerUseCase = new RegisterUserUseCase(userRepo, tokenService);
    authUseCase = new AuthenticateUserUseCase(userRepo, tokenService);
  });

  it('should register a new user and generate auth tokens', async () => {
    const result = await registerUseCase.execute({
      email: 'alex@example.com',
      password: 'StrongPassword123!',
      name: 'Alex Developer'
    });

    expect(result.user.id).toBeDefined();
    expect(result.user.email).toBe('alex@example.com');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();

    const saved = await userRepo.findByEmail('alex@example.com');
    expect(saved).not.toBeNull();
  });

  it('should throw ConflictError when registering with duplicate email', async () => {
    await registerUseCase.execute({
      email: 'alex@example.com',
      password: 'StrongPassword123!',
      name: 'Alex Developer'
    });

    await expect(registerUseCase.execute({
      email: 'alex@example.com',
      password: 'AnotherPassword',
      name: 'Duplicate'
    })).rejects.toThrow(ConflictError);
  });

  it('should authenticate user with valid credentials', async () => {
    await registerUseCase.execute({
      email: 'alex@example.com',
      password: 'StrongPassword123!',
      name: 'Alex Developer'
    });

    const loginResult = await authUseCase.execute({
      email: 'alex@example.com',
      password: 'StrongPassword123!'
    });

    expect(loginResult.user.email).toBe('alex@example.com');
    expect(loginResult.tokens.accessToken).toBeDefined();
  });

  it('should throw UnauthorizedError on non-existent email or wrong password', async () => {
    await expect(authUseCase.execute({
      email: 'nonexistent@example.com',
      password: 'pass'
    })).rejects.toThrow(UnauthorizedError);

    await registerUseCase.execute({
      email: 'alex@example.com',
      password: 'CorrectPassword',
      name: 'Alex'
    });

    await expect(authUseCase.execute({
      email: 'alex@example.com',
      password: 'WrongPassword'
    })).rejects.toThrow(UnauthorizedError);
  });

  it('should verify access and refresh tokens correctly', () => {
    const tokens = tokenService.generateTokens({ userId: 'u-1', email: 'test@example.com' });
    const accessPayload = tokenService.verifyAccessToken(tokens.accessToken);
    expect(accessPayload.userId).toBe('u-1');

    const refreshPayload = tokenService.verifyRefreshToken(tokens.refreshToken);
    expect(refreshPayload.userId).toBe('u-1');

    expect(() => tokenService.verifyAccessToken('invalid-token')).toThrow(UnauthorizedError);
    expect(() => tokenService.verifyRefreshToken('invalid-token')).toThrow(UnauthorizedError);
  });
});
