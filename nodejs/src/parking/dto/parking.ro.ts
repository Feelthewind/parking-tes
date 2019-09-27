import { UserRO } from "../../auth/dto/user.ro";
import { TimezoneRO } from "./timezone.ro";

export class ParkingRO {
  id: number;
  isAvailable: boolean;
  coordinates: number[];
  price: number;
  description: string;
  timezones?: TimezoneRO[];
  owner?: UserRO;
  images?: string[];
}
