import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class SignUpDTO {
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEmail()
  @MinLength(4)
  @MaxLength(100)
  @IsNotEmpty()
  email: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isDisabled: boolean;
}
