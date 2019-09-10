import { Test } from '@nestjs/testing';
import { User } from '../user.entity';
import { UserRepository } from '../user.repository';
import { JwtStrategy } from './jwt.strategy';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates and returns the user based on JWT payload', async () => {
      const user = new User();
      user.email = 'test@gmail.com';

      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate({ email: 'test@gmail.com' });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        email: 'test@gmail.com',
      });
      expect(result).toEqual(user);
    });

    // it('calls userRepository.findOne with provider and thirdPartyID if social login', async () => {
    //   await jwtStrategy.validate({
    //     provider: SocialProvider.GOOGLE,
    //     thirdPartyID: '12345',
    //   });
    //   expect(userRepository.findOne).toHaveBeenCalledWith({
    //     provider: SocialProvider.GOOGLE,
    //     thirdPartyID: '12345',
    //   });
    // });
  });
});
