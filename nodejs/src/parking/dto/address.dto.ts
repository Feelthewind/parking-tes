import { IsNotEmpty, IsString } from 'class-validator';

export class AddressDTO {
  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsNotEmpty()
  address2: string;

  @IsNotEmpty()
  address3: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  postalCode: string;
}
