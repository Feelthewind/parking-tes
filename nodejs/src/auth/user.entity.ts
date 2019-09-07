import * as bcrypt from 'bcryptjs';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  salt: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  address: string;

  @Column()
  is_disabled: boolean;

  @Column()
  type: string;

  @Column({ nullable: true })
  creditCardNumber: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    console.log(hash);
    console.log(this.password);
    return hash === this.password;
  }
}
