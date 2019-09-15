import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { UserRepository } from '../auth/user.repository';
import { Address } from './address/address.entity';
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
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
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
    const { coordinates, isAvailable } = createParkingDTO;

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { address } = createParkingDTO;
      let newAddress = this.addressRepository.create(address);
      newAddress = await queryRunner.manager.save(newAddress);

      let parking = this.parkingRepository.create();
      parking.addressId = newAddress.id;
      parking.coordinates = coordinates;
      // parking.isAvailable = isAvailable;
      parking.isAvailable = false;
      parking.userId = user.id;
      parking = await queryRunner.manager.save(parking);
      await queryRunner.commitTransaction();
      return parking;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // return this.parkingRepository.createParking(
    //   createParkingDTO,
    //   user,
    //   newAddress,
    // );
  }

  async createOffer(parkingId: number, user: User): Promise<void> {
    const parking = await this.parkingRepository.findOne({ id: parkingId });
    if (!parking.isAvailable) {
      throw new NotAcceptableException();
    }
    const offer = this.offerRepository.create();
    offer.buyerId = user.id;
    offer.parkingId = parkingId;
    try {
      await offer.save();
    } catch (error) {
      console.error(error);
    }
  }

  async acceptOffer(buyerId: number, owner: User): Promise<void> {
    const {
      parking: { id: parkingId },
    } = await this.userRepository.findOne(
      { id: owner.id },
      { relations: ['parking'] },
    );
    try {
      await this.offerRepository.update(
        { parkingId, buyerId },
        { chosen: true },
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getParkings(): Promise<Parking[]> {
    // return this.parkingRepository.find({ isAvailable: true });
    return this.parkingRepository.find({
      relations: ['address', 'user'],
    });
  }
}
