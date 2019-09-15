import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Address } from './address/address.entity';

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

  @OneToOne(type => User, user => user.parking)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column()
  addressId: number;

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // @Index({ spatial: true })
  // coordinates: string;
}
