import { OrderRO } from "../../order/ro/order.ro";

export class UserRO {
  id: number;
  name: string;
  isSharing: boolean;
  inUse: boolean;
  isDisabled?: boolean;
  imgURL?: string;
  accessToken?: string;
  orders?: OrderRO[];
}
