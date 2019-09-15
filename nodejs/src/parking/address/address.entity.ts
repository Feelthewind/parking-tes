import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Parking } from '../parking.entity';

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address1: string;

  @Column()
  address2: string;

  @Column()
  address3: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'postcal_code' })
  postalCode: string;

  @OneToOne(type => Parking, parking => parking.address)
  parking: Parking;
}
