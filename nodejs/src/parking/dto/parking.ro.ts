import { UserRO } from "../../auth/dto/user.ro";
import { TimezoneRO } from "./timezone.ro";

export class ParkingRO {
  id: number;
  isAvailable: boolean;
  coordinates: number[];
  timezones?: TimezoneRO[];
  owner?: UserRO;
}
