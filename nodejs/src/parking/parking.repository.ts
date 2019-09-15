import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Address } from './address/address.entity';
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
    address: Address,
  ): Promise<Parking> {
    const { coordinates, isAvailable } = createParkingDTO;

    const parking = this.create();
    parking.address = address;
    parking.coordinates = coordinates;
    // parking.isAvailable = isAvailable;
    parking.isAvailable = false;
    parking.userId = user.id;
    try {
      return await parking.save();
    } catch (error) {
      console.error(error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Address already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
