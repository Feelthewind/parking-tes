import { SocialProvider } from "../enum/provider.enum";

export class SocialLoginDTO {
  provider: SocialProvider;
  thirdPartyID: string;
  email: string;
}
