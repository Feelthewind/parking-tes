import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

const mockRepository = {
  changePassword: jest.fn(),
};

describe('AuthService', () => {
  let userRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: '123',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('changePassword', () => {
    let user;
    const mockDTO = {
      currentPassword: '123',
      newPassword: '321',
    };

    beforeEach(() => {
      user = new User();
      user.validatePassword = jest.fn();
      userRepository.changePassword = jest.fn();
    });

    it('returns success message if password is correct', async () => {
      user.validatePassword.mockResolvedValue(true);
      userRepository.changePassword.mockResolvedValue(undefined);
      const result = await authService.changePassword(mockDTO, user);
      expect(result).toEqual('Password changed!');
    });

    it('returns failure message if password is wrong', async () => {
      user.validatePassword.mockResolvedValue(false);
      const result = await authService.changePassword(mockDTO, user);
      expect(userRepository.changePassword).not.toBeCalled();
      expect(result).toEqual('Something went wrong!');
    });
  });
});
