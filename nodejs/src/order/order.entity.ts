import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../auth/user.entity";
import { Parking } from "../parking/entity/parking.entity";
import { OrderState } from "./enum/order-state.enum";
import { OrderRO } from "./ro/order.ro";

@Entity("orders")
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Parking)
  @JoinColumn({ name: "fk_parking_id" })
  parking: Parking;

  @ManyToOne(type => User, user => user.orders)
  @JoinColumn({ name: "fk_buyer_id" })
  buyer: User;

  @Column()
  fk_parking_id: number;

  @Column()
  fk_buyer_id: number;

  @Column({ type: "timestamptz" })
  from: Date;

  @Column({ type: "timestamptz" })
  to: Date;

  @Column({ name: "card_number" })
  cardNumber: string;

  @Column({ default: OrderState.IN_USE })
  state: OrderState;

  @Column({ type: "timestamp", name: "created_at" })
  @CreateDateColumn()
  createdAt: Date;

  toResponseObject() {
    const { id, from, to, state } = this;
    const responseObject: OrderRO = {
      id,
      from,
      to,
      state,
    };
    if (this.parking) {
      responseObject.parking = this.parking.toResponseObject();
    }
    if (this.buyer) {
      responseObject.buyer = this.buyer.toResponseObject();
    }
    return responseObject;
  }
}
