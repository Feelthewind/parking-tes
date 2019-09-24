import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../auth/user.entity";
import { Timezone } from "./timezone.entity";

@Entity()
export class Parking extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("geometry", {
    nullable: true,
    spatialFeatureType: "Point",
    srid: 4326,
  })
  coordinates: object;

  @Column({ default: false })
  isAvailable: boolean;

  @OneToOne(type => User, user => user.parking)
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  // @OneToOne(type => Address, address => address.parking)
  // @JoinColumn({ name: 'fk_address_id' })
  // address: Address;

  @Column({ name: "fk_user_id" })
  userId: number;

  // @Column({ name: 'fk_address_id' })
  // addressId: number;

  @OneToMany(type => Timezone, timezone => timezone.parking)
  timezones: Timezone[];

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // @Index({ spatial: true })
  // coordinates: string;
}
