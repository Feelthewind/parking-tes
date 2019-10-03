import { Logger } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { Parking } from "../entity/parking.entity";

@EntityRepository(Parking)
export class ParkingRepository extends Repository<Parking> {
  private logger = new Logger("ParkingRepository");

  // async update(isAvailable: boolean, user: User): Promise<User> {
  //   const { email, name, password, isDisabled } = signUpDTO;

  //   const found = await this.findOne({ email });
  //   if (found) {
  //     throw new ConflictException("Email already exists");
  //   }

  //   const user = this.create();
  //   user.email = email;
  //   user.name = name;
  //   user.salt = await bcrypt.genSalt();
  //   user.password = await this.hashPassword(password, user.salt);
  //   user.isDisabled = isDisabled;

  //   try {
  //     return user.save();
  //   } catch (error) {
  //     this.logger.error(error);
  //     // if (error.code === 'ER_DUP_ENTRY') {
  //     //   throw new ConflictException('Email Or Address already exists');
  //     // } else {
  //     throw new InternalServerErrorException();
  //     // }
  //   }
  // }
}
