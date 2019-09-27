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
import { ParkingRO } from "../dto/parking.ro";
import { ParkingImage } from "./parkingImage.entity";
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
  coordinates: Coordinates;

  @Column({ default: false })
  isAvailable: boolean;

  @Column({ type: "money" })
  price: number;

  @Column()
  description: string;

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

  @OneToMany(type => ParkingImage, images => images.parking)
  images: ParkingImage[];

  toResponseObject() {
    const { id, isAvailable, price, description } = this;
    const responseObject: ParkingRO = {
      id,
      isAvailable,
      price,
      description,
      coordinates: this.coordinates.coordinates,
    };
    if (this.timezones) {
      responseObject.timezones = this.timezones.map(t => t.toResponseObject());
    }
    if (this.user) {
      responseObject.owner = this.user.toResponseObject();
    }
    if (this.images) {
      responseObject.images = this.images.map(image => image.url);
    }
    return responseObject;
  }
}

interface Coordinates {
  type: string;
  coordinates: number[];
}
