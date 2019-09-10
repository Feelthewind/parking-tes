import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { IJwtPayload } from './interface/jwt-payload.interface';
import { SocialProvider } from './provider.enum';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  signUp(signUpDTO: SignUpDTO): Promise<void> {
    return this.userRepository.signUp(signUpDTO);
  }

  async signIn(signInDTO: SignInDTO): Promise<{ accessToken: string }> {
    const email = await this.userRepository.validateUserPassword(signInDTO);

    if (!email) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: Partial<IJwtPayload> = { email };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }

  async refreshToken(payload: Partial<IJwtPayload>) {
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }

  async validateOAuthLogin(
    thirdPartyID: string,
    provider: SocialProvider,
  ): Promise<string> {
    try {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      // let user: IUser = await this.usersService.findOneByThirdPartyId(thirdPartyId, provider);
      const user = await this.userRepository.findOne({
        provider,
        thirdPartyID,
      });

      if (!user) {
        await this.userRepository.createSocialUser(thirdPartyID, provider);
      }

      const payload = {
        thirdPartyID,
        provider,
      };

      const jwt: string = this.jwtService.sign(payload);
      return jwt;
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }

  async updateUser(updateUserDTO: UpdateUserDTO, user: User): Promise<void> {
    await this.userRepository.update({ id: user.id }, updateUserDTO);
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO, user: User) {
    const { currentPassword, newPassword } = changePasswordDTO;
    const valid = await user.validatePassword(currentPassword);
    if (valid) {
      await this.userRepository.changePassword(newPassword, user);
      return 'Password changed!';
    } else {
      return 'Something went wrong!';
    }
  }
}
