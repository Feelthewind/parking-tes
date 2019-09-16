import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// export class TimezoneDTO {
//   @IsNotEmpty()
//   @IsString()
//   from: string;

//   @IsNotEmpty()
//   @IsString()
//   to: string;
// }

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
