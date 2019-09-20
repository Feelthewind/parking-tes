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

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Parking)
  @JoinColumn({ name: "fk_parking_id" })
  parking: Parking;

  @ManyToOne(type => User)
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

  @Column({ default: OrderState.IN_USE })
  state: OrderState;

  @Column({ type: "timestamp", name: "created_at" })
  @CreateDateColumn()
  createdAt: Date;
}
