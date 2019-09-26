import { IsNotEmpty, IsString } from "class-validator";

export class ParkingImageDTO {
  @IsNotEmpty()
  @IsString()
  url: string;
}
