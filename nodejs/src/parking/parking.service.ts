import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { AddressRepository } from './address/address.repository';
import { CreateParkingDTO } from './dto/create-parking.dto';
import { OfferRepository } from './offer/offer.repository';
import { Parking } from './parking.entity';
import { ParkingRepository } from './parking.repository';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ParkingRepository)
    private parkingRepository: ParkingRepository,
    @InjectRepository(OfferRepository)
    private offerRepository: OfferRepository,
    @InjectRepository(AddressRepository)
    private addressRepository: AddressRepository,
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
    // get this from coordinates!
    // const address: IAddress = {
    //   state: '경기도',
    //   city: '구리시',
    //   address1: '인창동',
    //   address2: '66-9',
    //   address3: '인창 아파트 101동 1501호',
    //   postalCode: '11917',
    // };
    const { address } = createParkingDTO;
    const addressEntity = await this.addressRepository.createAddress(address);
    return this.parkingRepository.createParking(
      createParkingDTO,
      user,
      addressEntity,
    );
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

  async getParkings(): Promise<Parking[]> {
    return this.parkingRepository.find({ isAvailable: true });
  }
}
