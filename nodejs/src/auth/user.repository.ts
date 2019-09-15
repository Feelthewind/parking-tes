import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EntityRepository, MoreThan, Repository } from 'typeorm';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { SocialProvider } from './enum/provider.enum';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('UserRepository');

  async signUp(signUpDTO: SignUpDTO): Promise<void> {
    const { email, name, password, isDisabled, type } = signUpDTO;

    const found = await this.findOne({ email });
    if (found) {
      throw new ConflictException('Email already exists');
    }

    const user = this.create();
    user.email = email;
    user.name = name;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.type = type;
    user.isDisabled = isDisabled;

    try {
      await user.save();
    } catch (error) {
      this.logger.error(error);
      // if (error.code === 'ER_DUP_ENTRY') {
      //   throw new ConflictException('Email Or Address already exists');
      // } else {
      throw new InternalServerErrorException();
      // }
    }
  }

  async createSocialUser(
    thirdPartyID: string,
    provider: SocialProvider,
  ): Promise<void> {
    const user = this.create();
    user.thirdPartyID = thirdPartyID;
    user.provider = provider;

    console.dir(user);

    try {
      await user.save();
    } catch (error) {
      this.logger.error(error);
    }
  }

  async validateUserPassword(signInDTO: SignInDTO): Promise<User> {
    const { email, password } = signInDTO;
    const user = await this.findOne({ email });

    if (user && (await user.validatePassword(password))) {
      return user;
    } else {
      return null;
    }
  }

  async changePassword(password: string, user: User): Promise<void> {
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    try {
      await user.save();
    } catch (error) {
      console.error(error);
    }
  }

  async resetPassword(password: string, token: string) {
    try {
      const user = await this.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(Date.now()),
      });
      if (!user) {
        return;
      } else {
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);
        user.resetPasswordExpires = undefined;
        user.resetPasswordToken = undefined;

        await user.save();
        return user;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
