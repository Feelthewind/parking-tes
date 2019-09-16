import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Parking } from './parking.entity';

@Entity()
export class Timezone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: number;

  @Column({ type: 'time' })
  from: string;

  @Column({ type: 'time' })
  to: string;

  @ManyToOne(type => Parking, parking => parking.timezones)
  @JoinColumn()
  parking: Parking;

  @Column({ name: 'parking_id' })
  parkingId: number;
}
