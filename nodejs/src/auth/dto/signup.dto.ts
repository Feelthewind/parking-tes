import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  @IsNotEmpty()
  address: string;

  @IsBoolean()
  @IsNotEmpty()
  isDisabled: boolean;

  @IsNotEmpty()
  type: string;
}
