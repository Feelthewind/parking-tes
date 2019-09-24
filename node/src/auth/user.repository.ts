import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EntityRepository, Repository } from 'typeorm';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('UserRepository');

  async signUp(signUpDTO: SignUpDTO): Promise<void> {
    const { address, email, name, password, is_disabled, type } = signUpDTO;

    const user = new User();
    user.address = address;
    user.email = email;
    user.name = name;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.type = type;
    user.is_disabled = is_disabled;

    try {
      await user.save();
    } catch (error) {
      this.logger.error(error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email Or Address already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword(signInDTO: SignInDTO): Promise<string> {
    const { email, password } = signInDTO;
    const user = await this.findOne({ email });

    console.dir(user);

    if (user && (await user.validatePassword(password))) {
      return user.email;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
