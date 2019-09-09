import { Injectable } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { OfferRepository } from './offer.repository';
import { Parking } from './parking.entity';
import { ParkingRepository } from './parking.repository';

@Injectable()
export class ParkingService {
  constructor(
    private userRepository: UserRepository,
    private parkingRepository: ParkingRepository,
    private offerRepository: OfferRepository,
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

  async createOffer(parkingId: number, user: User): Promise<void> {
    const offer = this.offerRepository.create();
    offer.buyerId = user.id;
    offer.parkingId = parkingId;
    try {
      await offer.save();
    } catch (error) {
      console.error(error);
    }
  }

  async acceptOffer(parkingId: number, user: User): Promise<void> {
    try {
      await this.offerRepository.update(
        { parkingId, buyerId: user.id },
        { chosen: true },
      );
    } catch (error) {
      console.error(error);
    }
  }
}
