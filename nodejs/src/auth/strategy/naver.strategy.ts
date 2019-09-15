import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import { SocialProvider } from '../enum/provider.enum';

const naverConfig = config.get('social.naver');

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  private logger = new Logger('NaverStrategy');

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
      this.logger.log(`Profile: ${JSON.stringify(profile)}`);
      const jwt = await this.authService.validateOAuthLogin(
        profile.id,
        SocialProvider.NAVER,
      );
      const user = {
        jwt,
      };

      done(null, user);
    } catch (err) {
      this.logger.error(err);
      done(err, false);
    }
  }
}
