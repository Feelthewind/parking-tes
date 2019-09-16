import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Address } from './address.entity';
import { DaysDTO } from './dto/days.dto';

@Entity()
export class Parking extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(type => Address, address => address.parking)
  @JoinColumn()
  address: Address;

  @Column()
  coordinates: string;

  @Column({ default: false })
  isAvailable: boolean;

  @Column({ type: 'jsonb' })
  days: DaysDTO;

  @OneToOne(type => User, user => user.parking)
  @JoinColumn()
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'address_id' })
  addressId: number;

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // @Index({ spatial: true })
  // coordinates: string;
}
