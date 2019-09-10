import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;
    const mockSignUpDTO = {
      email: 'test@gmail.com',
      password: 'password',
    };

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('Successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockSignUpDTO)).resolves.not.toThrow();
    });
  });
});
