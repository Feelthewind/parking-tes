import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TimezoneDTO {
  @IsNumber()
  @IsNotEmpty()
  day: number;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;
}
