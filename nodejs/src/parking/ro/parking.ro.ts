import { UserRO } from "../../auth/ro/user.ro";
import { TimezoneRO } from "../dto/timezone.ro";

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
