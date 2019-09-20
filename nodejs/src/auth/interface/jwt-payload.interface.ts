import { SocialProvider } from "../enum/provider.enum";

export interface IJwtPayload {
  email: string;
  provider: SocialProvider;
  thirdPartyID: string;
  isSharing: boolean;
}
