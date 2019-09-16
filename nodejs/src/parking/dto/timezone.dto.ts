import { IsNotEmpty, IsString } from 'class-validator';

export class TimezoneDTO {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;
}
