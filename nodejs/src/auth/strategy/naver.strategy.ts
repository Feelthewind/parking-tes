import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import { SocialProvider } from '../provider.enum';

const naverConfig = config.get('social.naver');

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: naverConfig.get('clientID'),
      clientSecret: naverConfig.get('clientSecret'),
      callbackURL: 'http://localhost:3000/auth/naver/callback',
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: Function,
  ) {
    try {
      console.log(profile);
      console.log(accessToken);
      console.log(refreshToken);

      const jwt = await this.authService.validateOAuthLogin(
        profile.id,
        SocialProvider.NAVER,
      );
      const user = {
        jwt,
      };

      done(null, user);
    } catch (err) {
      // console.log(err)
      done(err, false);
    }
  }
}
