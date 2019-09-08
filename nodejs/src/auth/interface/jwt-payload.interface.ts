import { SocialProvider } from '../provider.enum';

export interface IJwtPayload {
  email: string;
  provider: SocialProvider;
  thirdPartyID: string;
  expiresIn: number;
}
