import { ParkingRO } from "../../parking/dto/parking.ro";
import { OrderState } from "../enum/order-state.enum";

export class OrderRO {
  id: number;
  from: Date;
  to: Date;
  state: OrderState;
  parking?: ParkingRO;
}
