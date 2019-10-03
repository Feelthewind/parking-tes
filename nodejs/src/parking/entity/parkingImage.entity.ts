import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Parking } from "./parking.entity";

@Entity("parking_images")
export class ParkingImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(type => Parking)
  @JoinColumn({ name: "fk_parking_id" })
  parking: Parking;

  @Column({ name: "fk_parking_id" })
  parkingId: number;
}
