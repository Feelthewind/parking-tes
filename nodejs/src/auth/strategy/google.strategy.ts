import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { SocialProvider } from '../provider.enum';

const googleConfig = config.get('social.google');

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: googleConfig.get('clientID'),
      clientSecret: googleConfig.get('clientSecret'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
      scope: ['profile'],
      accessType: 'offline',
      prompt: 'consent',
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
      console.log(refreshToken);
      console.log(accessToken);

      const jwt = await this.authService.validateOAuthLogin(
        profile.id,
        SocialProvider.GOOGLE,
        refreshToken,
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
