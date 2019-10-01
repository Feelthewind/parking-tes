import { IsEmail, IsIn, IsNotEmpty, MaxLength } from "class-validator";
import { SocialProvider } from "../enum/provider.enum";

export class SocialLoginDTO {
  @IsIn([SocialProvider.GOOGLE, SocialProvider.NAVER])
  @IsNotEmpty()
  provider: SocialProvider;

  @IsNotEmpty()
  thirdPartyID: string;

  @IsEmail()
  @MaxLength(50)
  email: string;
}
