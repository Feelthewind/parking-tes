import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { Parking } from './parking.entity';

@EntityRepository(Parking)
export class ParkingRepository extends Repository<Parking> {
  async setLocation(lat: number, lng: number, user: User) {
    // console.log('called');
    // await getManager()
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Parking)
    //   .values({
    //     coordinates: () => `ST_GeomFromText('POINT(${lat} ${lng})', 4326)`,
    //   })
    //   .execute();
  }

  async createParking(
    createParkingDTO: CreateParkingDTO,
    user: User,
  ): Promise<Parking> {
    const { address, isAvailable } = createParkingDTO;
    const parking = this.create();
    parking.address = address;
    parking.isAvailable = isAvailable;
    parking.userId = user.id;
    try {
      return await parking.save();
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Address already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
