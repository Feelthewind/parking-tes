import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { SocialProvider } from '../enum/provider.enum';

const googleConfig = config.get('social.google');

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger('GoogleStrategy');

  constructor(private readonly authService: AuthService) {
    super({
      clientID: googleConfig.get('clientID'),
      clientSecret: googleConfig.get('clientSecret'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
      scope: ['profile'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: Function,
  ) {
    this.logger.log(`Profile is ${JSON.stringify(profile)}`);

    try {
      const jwt = await this.authService.validateOAuthLogin(
        profile.id,
        SocialProvider.GOOGLE,
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
