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
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserRepository } from './user.repository';

export enum Provider {
  GOOGLE = 'google',
}

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

    const payload: Partial<JwtPayload> = { email };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );

    return { accessToken };
  }

  async validateOAuthLogin(
    third_party_id: string,
    provider: Provider,
  ): Promise<string> {
    try {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      // let user: IUser = await this.usersService.findOneByThirdPartyId(thirdPartyId, provider);
      const user = await this.userRepository.findOne({
        provider,
        third_party_id,
      });

      if (!user) {
        await this.userRepository.createSocialUser(third_party_id, provider);
      }

      const payload = {
        third_party_id,
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
