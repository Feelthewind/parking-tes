import { OrderState } from '../enum/order-state.enum';

export class CreateOrderDTO {
  fk_parking_id: number;
  from: string;
  to: string;
  state: OrderState;
}
