import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SocialJwtPayload } from './jwt-payload.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class SocialJwtStrategy extends PassportStrategy(
  Strategy,
  'social-jwt',
) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  async validate(payload: SocialJwtPayload) {
    // const { provider, thirdPartyId } = payload;
    // const user = await this.userRepository.findOne({
    //   where: { provider, thirdPartyId },
    // });

    // if (!user) {
    //   throw new UnauthorizedException();
    // }

    return payload;
  }
}
