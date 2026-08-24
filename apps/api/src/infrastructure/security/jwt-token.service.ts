import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@personal-os/shared';
import { AuthTokensDto } from '@personal-os/types';
import { TokenServicePort, UserTokenPayload } from '../../core/application/ports/out/token-service.port.js';

export class JwtTokenService implements TokenServicePort {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn = '1h';
  private readonly refreshExpiresIn = '7d';

  constructor(accessSecret = 'default-access-jwt-secret-key-12345', refreshSecret = 'default-refresh-jwt-secret-key-12345') {
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
  }

  generateTokens(payload: UserTokenPayload): AuthTokensDto {
    const accessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      this.accessSecret,
      { expiresIn: this.accessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 3600
    };
  }

  verifyAccessToken(token: string): UserTokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as jwt.JwtPayload;
      if (!decoded.userId || !decoded.email) {
        throw new UnauthorizedError('Invalid token payload');
      }
      return { userId: decoded.userId as string, email: decoded.email as string };
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): UserTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as jwt.JwtPayload;
      if (!decoded.userId || !decoded.email) {
        throw new UnauthorizedError('Invalid token payload');
      }
      return { userId: decoded.userId as string, email: decoded.email as string };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
