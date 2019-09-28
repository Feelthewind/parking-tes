import { OrderRO } from "../../order/ro/order.ro";

export class UserRO {
  id: number;
  name: string;
  isDisabled: boolean;
  isSharing: boolean;
  imgURL: string;
  orders?: OrderRO[];
  inUse?: boolean;
}
