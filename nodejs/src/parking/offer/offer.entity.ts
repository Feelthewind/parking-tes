import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/user.entity';
import { Parking } from '../parking.entity';

@Entity()
export class Offer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  chosen: boolean;

  @ManyToOne(type => Parking)
  @JoinColumn({ name: 'parking_id' })
  parkingId: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'buyer_id' })
  buyerId: number;
}
