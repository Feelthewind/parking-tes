import { UserRO } from "../../auth/ro/user.ro";
import { ParkingRO } from "../../parking/ro/parking.ro";
import { OrderState } from "../enum/order-state.enum";

export class OrderRO {
  id: number;
  from: Date;
  to: Date;
  state: OrderState;
  parking?: ParkingRO;
  buyer?: UserRO;
}
