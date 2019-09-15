import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDTO } from './address.dto';

export class CreateParkingDTO {
  @IsNotEmpty()
  @IsString()
  coordinates: string;

  @IsOptional()
  isAvailable: boolean;

  @ValidateNested({ each: true, always: true })
  @Type(() => AddressDTO)
  @IsNotEmpty()
  readonly address: AddressDTO;
}
