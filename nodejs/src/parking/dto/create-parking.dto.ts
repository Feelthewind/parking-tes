import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { AddressDTO } from './address.dto';
import { TimezoneDTO } from './timezone.dto';

export class CreateParkingDTO {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;

  @IsOptional()
  isAvailable: boolean;

  @ValidateNested({ each: true, always: true })
  @Type(() => AddressDTO)
  @IsNotEmpty()
  readonly address: AddressDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  @IsNotEmpty()
  timezones: TimezoneDTO[];
}
