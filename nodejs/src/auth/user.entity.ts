import * as bcrypt from 'bcryptjs';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

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
  address: string;

  @Column({ nullable: true })
  is_disabled: boolean;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  credit_card_number: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  third_party_id: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    console.log(hash);
    console.log(this.password);
    return hash === this.password;
  }
}
