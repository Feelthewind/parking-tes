import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class SignInDTO {
  @IsEmail()
  @MaxLength(50)
  @IsNotEmpty()
  email: string;

  @MinLength(5)
  @MinLength(20)
  @IsNotEmpty()
  password: string;
}
