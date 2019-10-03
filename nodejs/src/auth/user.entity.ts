import * as bcrypt from "bcryptjs";
import { Exclude } from "class-transformer";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "../order/order.entity";
import { Parking } from "../parking/entity/parking.entity";
import { SocialProvider } from "./enum/provider.enum";
import { UserRO } from "./ro/user.ro";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Index()
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, name: "is_sharing", default: false })
  isSharing: boolean;

  @Column({ nullable: true, name: "in_use", default: false })
  inUse: boolean;

  @Column({ nullable: true, name: "img_url" })
  imgURL: string;

  @Column({ nullable: true, name: "reset_password_token" })
  resetPasswordToken: string;

  @Column({ type: "bigint", nullable: true, name: "reset_password_expires" })
  resetPasswordExpires: number;

  @OneToOne(type => Parking, parking => parking.user)
  parking: Parking;

  @OneToMany(type => Order, order => order.buyer)
  orders: Order[];

  @Column({ nullable: true })
  provider: SocialProvider;

  @Column({ nullable: true, name: "third_party_id" })
  thirdPartyID: string;

  @Column({ nullable: true, name: "credit_card_number" })
  creditCardNumber: string;

  @Column({ nullable: true, name: "is_disabled", default: false })
  isDisabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  toResponseObject(accessToken: string = null) {
    const { id, name, isSharing, inUse, imgURL, isDisabled } = this;
    const responseObject: UserRO = {
      id,
      name,
      isDisabled,
      isSharing,
      imgURL,
      inUse,
      accessToken,
    };

    return responseObject;
  }
}
