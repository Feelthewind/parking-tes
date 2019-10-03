import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Parking } from "./parking.entity";

@Entity("timezones")
export class Timezone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int2" })
  day: number;

  @Column({ type: "time" })
  from: string;

  @Column({ type: "time" })
  to: string;

  @ManyToOne(type => Parking, parking => parking.timezones)
  @JoinColumn({ name: "fk_parking_id" })
  parking: Parking;

  @Column({ name: "fk_parking_id" })
  parkingId: number;

  toResponseObject() {
    const { day, from, to } = this;
    const responseObject = {
      day,
      from,
      to,
    };
    return responseObject;
  }
}
