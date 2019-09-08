import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { sign } from 'jsonwebtoken';
import { SignInDTO } from './dto/signin.dto';
import { SignUpDTO } from './dto/signup.dto';
import { IJwtPayload } from './interface/jwt-payload.interface';
import { SocialProvider } from './provider.enum';
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

  async validateOAuthLogin(
    thirdPartyID: string,
    provider: SocialProvider,
    refreshToken: string,
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
        console.log(refreshToken);
        await this.userRepository.createSocialUser(
          thirdPartyID,
          provider,
          refreshToken,
        );
      }

      const payload = {
        thirdPartyID,
        provider,
      };

      const jwt: string = sign(payload, config.get('jwt.secret'), {
        expiresIn: 3600,
      });
      return jwt;
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }
}
