import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/user.entity';
import { Parking } from '../entity/parking.entity';

@Entity()
export class Offer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  chosen: boolean;

  @ManyToOne(type => Parking)
  @JoinColumn({ name: 'fk_parking_id' })
  parkingId: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'fk_buyer_id' })
  buyerId: number;
}
