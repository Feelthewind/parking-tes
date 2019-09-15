import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from './user.entity';
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
      userRepository.findOne = jest.fn();
    });

    it('Successfully signs up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockSignUpDTO)).resolves.not.toThrow();
    });

    it('throws a conflict exception as email already exists', () => {
      userRepository.findOne.mockResolvedValue(mockSignUpDTO);
      expect(userRepository.signUp(mockSignUpDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an internal server exception', () => {
      userRepository.findOne.mockResolvedValue(undefined);
      save.mockRejectedValue({ code: 'fdjkf' });
      expect(userRepository.signUp(mockSignUpDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validatePassword', () => {
    let user;
    const mockSignInDTO = {
      email: 'test@gmail.com',
      password: 'password',
    };

    beforeEach(() => {
      userRepository.findOne = jest.fn();

      user = new User();
      user.email = 'test@gmail.com';
      user.validatePassword = jest.fn();
    });

    it('returns the user email as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockSignInDTO);
      expect(result).toMatchObject({ email: 'test@gmail.com' });
    });

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(mockSignInDTO);
      expect(result).toBeNull();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(mockSignInDTO);
      expect(result).toBeNull();
    });
  });
});
