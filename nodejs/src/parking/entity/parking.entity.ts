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
import { Order } from "../../order/order.entity";
import { Coordinates } from "../interface/coordinates";
import { ParkingRO } from "../ro/parking.ro";
import { ParkingImage } from "./parkingImage.entity";
import { Timezone } from "./timezone.entity";

@Entity()
export class Parking extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("geometry", {
    spatialFeatureType: "Point",
    srid: 4326,
  })
  coordinates: Coordinates;

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // @Index({ spatial: true })
  // coordinates: string;

  @Column({ default: true })
  isAvailable: boolean;

  // TODO: change it to double or something
  @Column({ type: "money" })
  price: number;

  @Column()
  description: string;

  @OneToOne(type => User, user => user.parking)
  @JoinColumn({ name: "fk_user_id" })
  user: User;

  @Column({ name: "fk_user_id" })
  userId: number;

  @OneToMany(type => Timezone, timezone => timezone.parking)
  timezones: Timezone[];

  // TODO: change it json type rather than another table
  @OneToMany(type => ParkingImage, images => images.parking)
  images: ParkingImage[];

  @OneToMany(type => Order, order => order.parking)
  orders: Order[];

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
