import { OrderState } from '../enum/order-state.enum';

export class CreateOrderDTO {
  fk_parking_id: number;
  from: Date;
  to: Date;
  state: OrderState;
}
