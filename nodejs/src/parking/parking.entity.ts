import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class Parking extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  isAvailable: boolean;

  @OneToOne(type => User, user => user.parking)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // @Index({ spatial: true })
  // coordinates: string;
}
