import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  imgURL: string;
}
