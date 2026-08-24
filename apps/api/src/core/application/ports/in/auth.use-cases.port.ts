import { RegisterUserDto, AuthenticateUserDto, AuthTokensDto, User } from '@personal-os/types';

export interface IRegisterUserUseCase {
  execute(dto: RegisterUserDto): Promise<{ user: User; tokens: AuthTokensDto }>;
}

export interface IAuthenticateUserUseCase {
  execute(dto: AuthenticateUserDto): Promise<{ user: User; tokens: AuthTokensDto }>;
}
