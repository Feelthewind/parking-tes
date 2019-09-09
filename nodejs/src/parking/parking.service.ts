import { Injectable } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { Parking } from './parking.entity';
import { ParkingRepository } from './parking.repository';

@Injectable()
export class ParkingService {
  constructor(
    private userRepository: UserRepository,
    private parkingRepository: ParkingRepository,
  ) {}

  // change address to lat, lng later for spatial column
  async setLocation(lat: number, lng: number, user: User): Promise<void> {
    await this.parkingRepository.setLocation(lat, lng, user);
  }

  async setAvailable(isAvailable: boolean, user: User) {
    await this.parkingRepository.update({ userId: user.id }, { isAvailable });
  }

  async createParking(
    createParkingDTO: CreateParkingDTO,
    user: User,
  ): Promise<Parking> {
    return this.parkingRepository.createParking(createParkingDTO, user);
  }
}
