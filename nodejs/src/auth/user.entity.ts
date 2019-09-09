import * as bcrypt from 'bcryptjs';
import { BaseEntity, Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Parking } from '../parking/parking.entity';
import { SocialProvider } from './provider.enum';

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
  type: string;

  @OneToOne(type => Parking, parking => parking.user)
  parking: Parking;

  @Column({ nullable: true })
  provider: SocialProvider;

  @Column({ nullable: true, name: 'third_party_id' })
  thirdPartyID: string;

  @Column({ nullable: true, name: 'credit_card_number' })
  creditCardNumber: string;

  @Column({ nullable: true, name: 'is_disabled' })
  isDisabled: boolean;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    console.log(hash);
    console.log(this.password);
    return hash === this.password;
  }
}
