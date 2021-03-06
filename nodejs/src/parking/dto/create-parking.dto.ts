import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { TimezoneDTO } from "./timezone.dto";

export class CreateParkingDTO {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;

  @IsOptional()
  isAvailable?: boolean;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  // @ValidateNested({ each: true, always: true })
  // @Type(() => AddressDTO)
  // @IsNotEmpty()
  // readonly address: AddressDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  @IsNotEmpty()
  timezones: TimezoneDTO[];

  // @ValidateNested({ each: true, always: true })
  // @Type(() => ParkingImageDTO)
  @IsNotEmpty()
  @IsArray()
  images: string[];
}
