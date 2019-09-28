import * as bcrypt from "bcryptjs";
import { Exclude } from "class-transformer";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderState } from "../order/enum/order-state.enum";
import { Order } from "../order/order.entity";
import { Parking } from "../parking/entity/parking.entity";
import { UserRO } from "./dto/user.ro";
import { SocialProvider } from "./enum/provider.enum";

@Entity()
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

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  toResponseObject() {
    const { id, name, isSharing, imgURL, isDisabled } = this;
    const responseObject: UserRO = {
      id,
      name,
      isDisabled,
      isSharing,
      imgURL,
    };
    if (this.orders) {
      responseObject.inUse =
        this.orders.filter(order => order.state === OrderState.IN_USE).length >
        0;
    }
    return responseObject;
  }
}
