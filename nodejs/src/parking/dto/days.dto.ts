import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { TimezoneDTO } from './timezone.dto';

export class DaysDTO {
  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  @IsNotEmpty()
  monday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  tuesday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  wednesday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  thursday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  @IsNotEmpty()
  friday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  saturday: TimezoneDTO;

  @ValidateNested({ each: true, always: true })
  @Type(() => TimezoneDTO)
  sunday: TimezoneDTO;
}
