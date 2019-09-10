import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '../interface/jwt-payload.interface';
import { User } from '../user.entity';
import { UserRepository } from '../user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  async validate(payload: Partial<IJwtPayload>): Promise<User> {
    const { email, provider, thirdPartyID } = payload;
    let user;
    if (!provider) {
      user = await this.userRepository.findOne({ email });
    } else {
      user = await this.userRepository.findOne({
        provider,
        thirdPartyID,
      });
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
