import { SocialProvider } from '../enum/provider.enum';
import { UserType } from '../enum/user-type.enum';

export interface IJwtPayload {
  email: string;
  provider: SocialProvider;
  thirdPartyID: string;
  type: UserType;
}
