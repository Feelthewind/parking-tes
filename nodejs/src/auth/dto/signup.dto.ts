import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../enum/user-type.enum';

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
  isDisabled: boolean;

  @IsNotEmpty()
  @IsEnum(UserType)
  type: UserType;
}
