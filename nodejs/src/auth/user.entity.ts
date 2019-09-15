import * as bcrypt from 'bcryptjs';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Parking } from '../parking/parking.entity';
import { SocialProvider } from './enum/provider.enum';
import { UserType } from './enum/user-type.enum';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  password: string;

  @Index()
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  type: UserType;

  @Column({ nullable: true, name: 'img_url' })
  imgURL: string;

  @Column({ nullable: true, name: 'reset_password_token' })
  resetPasswordToken: string;

  @Column({ type: 'bigint', nullable: true, name: 'reset_password_expires' })
  resetPasswordExpires: number;

  @OneToOne(type => Parking, parking => parking.user)
  parking: Parking;

  @Column({ nullable: true })
  provider: SocialProvider;

  @Column({ nullable: true, name: 'third_party_id' })
  thirdPartyID: string;

  @Column({ nullable: true, name: 'credit_card_number' })
  creditCardNumber: string;

  @Column({ nullable: true, name: 'is_disabled', default: false })
  isDisabled: boolean;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
